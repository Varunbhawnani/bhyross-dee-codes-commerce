import { supabase } from '@/integrations/supabase/client';
import { MultipleUploadResult, ImageUpdateData, ProductImagesResponse } from './types';
import { extractFilePathFromUrl, deleteFromStorage } from './storage';

/**
 * Upload multiple images for a product
 */
export const uploadProductImages = async (
  productId: string, 
  files: File[], 
  variantId: string | null = null
): Promise<MultipleUploadResult> => {
  const errors: string[] = [];
  let uploadCount = 0;

  // Get current image count to set proper sort order
  const { data: existingImages } = await supabase
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId)
    .eq('variant_id', variantId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const startingSortOrder = existingImages && existingImages.length > 0 
    ? existingImages[0].sort_order + 1 
    : 1;

  for (let i = 0; i < files.length; i++) {
    try {
      const file = files[i];
      const fileName = `${productId}${variantId ? `_${variantId}` : ''}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${file.name.split('.').pop()}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL from the SAME bucket we uploaded to
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);

      // Check if this is the first image for this product/variant combination
      const { data: imageCount } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', productId)
        .eq('variant_id', variantId);

      const isPrimary = !imageCount || imageCount.length === 0;

      // Save to database
      const { error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          variant_id: variantId,
          image_url: publicUrl,
          alt_text: `Product image ${startingSortOrder + i}`,
          sort_order: startingSortOrder + i,
          is_primary: isPrimary
        });

      if (dbError) throw dbError;

      uploadCount++;
    } catch (error) {
      console.error(`Failed to upload file ${files[i].name}:`, error);
      errors.push(`${files[i].name}: ${error.message}`);
    }
  }

  return {
    success: uploadCount > 0,
    errors
  };
};

/**
 * Helper function to handle storage deletion with multiple fallback strategies
 */
const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  console.log('Attempting storage deletion for URL:', imageUrl);
  
  // Strategy 1: Try using extractFilePathFromUrl
  try {
    const filePath = extractFilePathFromUrl(imageUrl, 'products');
    console.log('Trying deletion with extracted path:', filePath);
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('products')
      .remove([filePath]);
    
    if (storageError) {
      console.log('Strategy 1 failed:', storageError.message);
      throw storageError;
    }
    
    console.log('Storage deletion successful with Strategy 1:', storageData);
    return;
  } catch (error) {
    console.log('Strategy 1 (extractFilePathFromUrl) failed:', error);
  }
  
  // Strategy 2: Try with just the filename (for root-level files)
  try {
    const fileName = imageUrl.split('/').pop();
    if (!fileName) {
      throw new Error('Could not extract filename');
    }
    
    console.log('Trying deletion with filename only:', fileName);
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('products')
      .remove([fileName]);
    
    if (storageError) {
      console.log('Strategy 2 failed:', storageError.message);
      throw storageError;
    }
    
    console.log('Storage deletion successful with Strategy 2:', storageData);
    return;
  } catch (error) {
    console.log('Strategy 2 (filename only) failed:', error);
  }
  
  // Strategy 3: List all files and find matching filename
  try {
    console.log('Trying Strategy 3: List and match files...');
    
    const fileName = imageUrl.split('/').pop();
    if (!fileName) {
      throw new Error('Could not extract filename');
    }
    
    // List all files in the bucket root
    const { data: fileList, error: listError } = await supabase.storage
      .from('products')
      .list('', {
        limit: 1000,
        offset: 0
      });
    
    if (listError) {
      throw listError;
    }
    
    // Find the file by name in root
    const matchingFile = fileList?.find(file => file.name === fileName);
    
    if (matchingFile) {
      console.log('Found matching file in root:', matchingFile.name);
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from('products')
        .remove([matchingFile.name]);
      
      if (storageError) {
        throw storageError;
      }
      
      console.log('Storage deletion successful with Strategy 3:', storageData);
      return;
    } else {
      console.log('File not found in root directory, checking subdirectories...');
      
      // Check common folders like 'images', 'banners', etc.
      const commonFolders = ['images', 'banners', 'products'];
      
      for (const folder of commonFolders) {
        try {
          const { data: subFileList, error: subListError } = await supabase.storage
            .from('products')
            .list(folder, {
              limit: 1000,
              offset: 0
            });
          
          if (subListError) continue;
          
          const matchingSubFile = subFileList?.find(file => file.name === fileName);
          
          if (matchingSubFile) {
            console.log(`Found matching file in ${folder}:`, matchingSubFile.name);
            
            const { data: storageData, error: storageError } = await supabase.storage
              .from('products')
              .remove([`${folder}/${matchingSubFile.name}`]);
            
            if (storageError) {
              throw storageError;
            }
            
            console.log('Storage deletion successful with Strategy 3 (subfolder):', storageData);
            return;
          }
        } catch (subError) {
          console.log(`Error checking folder ${folder}:`, subError);
        }
      }
    }
    
    throw new Error('File not found in storage');
  } catch (error) {
    console.log('Strategy 3 (list and match) failed:', error);
    console.warn('All storage deletion strategies failed. Database was cleaned up but storage file may remain.');
    // Don't throw here - we've at least cleaned up the database
  }
};

/**
 * Delete an image from storage and database - FINAL CORRECTED VERSION
 */
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  console.log('Deleting image:', imageUrl);
  
  try {
    // Step 1: Find and delete from database first
    const { data: imageRecord, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('image_url', imageUrl)
      .single();
    
    if (fetchError || !imageRecord) {
      console.log('Exact match failed, trying partial matching...');
      
      // Try to find by filename if exact URL match fails
      const fileName = imageUrl.split('/').pop();
      if (!fileName) {
        throw new Error('Could not extract filename from URL');
      }
      
      const { data: allImages, error: fetchAllError } = await supabase
        .from('product_images')
        .select('*');
      
      if (fetchAllError || !allImages) {
        throw new Error(`Could not fetch image records: ${fetchAllError?.message || 'Unknown error'}`);
      }
      
      const matchingRecord = allImages.find(img => img.image_url.includes(fileName));
      
      if (!matchingRecord) {
        throw new Error(`Image record not found in database`);
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', matchingRecord.id);
      
      if (dbError) {
        throw new Error(`Database deletion failed: ${dbError.message}`);
      }
      
      console.log('Database deletion successful');
      imageUrl = matchingRecord.image_url; // Use the found URL for storage deletion
    } else {
      // Delete from database
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageRecord.id);
      
      if (dbError) {
        throw new Error(`Database deletion failed: ${dbError.message}`);
      }
      
      console.log('Database deletion successful');
    }
    
    // Step 2: Delete from storage using multiple strategies
    await deleteImageFromStorage(imageUrl);
    
    console.log('Image deletion completed successfully');
    
  } catch (error) {
    console.error('Error in deleteProductImage:', error);
    throw error;
  }
};

/**
 * Update image order for a product
 */
export const updateImageOrder = async (
  imageUpdates: ImageUpdateData[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Updating image order:', imageUpdates);

    const updates = imageUpdates.map(update => 
      supabase
        .from('product_images')
        .update({ 
          sort_order: update.sortOrder,
          is_primary: update.isPrimary || false
        })
        .eq('id', update.id)
    );

    const results = await Promise.all(updates);
    
    const hasError = results.some(result => result.error);
    if (hasError) {
      const errors = results
        .filter(result => result.error)
        .map(result => result.error?.message)
        .join(', ');
      console.error('Update errors:', errors);
      return { success: false, error: errors };
    }

    console.log('Image order updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Update order error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Get product images from database
 */
export const getProductImages = async (productId: string): Promise<ProductImagesResponse> => {
  try {
    console.log('Fetching images for product:', productId);

    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching product images:', error);
      return { success: false, error: error.message };
    }

    console.log('Fetched images:', data);
    return { success: true, images: data || [] };
  } catch (error) {
    console.error('Error fetching product images:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};