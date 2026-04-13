import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  Save,
  Bell,
  Shield,
  Globe,
  Mail,
  Loader2
} from 'lucide-react';

const SettingsTab: React.FC = () => {
  const { settings, updateSettings, saveSettings, isLoading, isSaving, error } = useSettings();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await saveSettings();
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />
        <span className="ml-2 text-neutral-600">Loading settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading settings: {error.message}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-neutral-900">Settings</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            General Settings
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => updateSettings({ siteName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => updateSettings({ siteDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={settings.currency} 
                onValueChange={(value) => updateSettings({ currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={settings.timezone} 
                onValueChange={(value) => updateSettings({ timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* System Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            System Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-neutral-600">Temporarily disable site access</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => updateSettings({ maintenanceMode: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Registration</Label>
                <p className="text-sm text-neutral-600">Allow new user registrations</p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => updateSettings({ allowRegistration: checked })}
              />
            </div>
            <div>
              <Label htmlFor="lowStock">Low Stock Threshold</Label>
              <Input
                id="lowStock"
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => updateSettings({ lowStockThreshold: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-neutral-600">Receive email alerts</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Order Notifications</Label>
                <p className="text-sm text-neutral-600">Get notified of new orders</p>
              </div>
              <Switch
                checked={settings.orderNotifications}
                onCheckedChange={(checked) => updateSettings({ orderNotifications: checked })}
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Contact Information
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => updateSettings({ contactEmail: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => updateSettings({ contactPhone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => updateSettings({ address: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Social Media Settings - Bhyross */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Bhyross Social Media
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bhyross-facebook">Facebook URL</Label>
              <Input
                id="bhyross-facebook"
                value={settings.socialMedia.bhyross.facebook}
                onChange={(e) => updateSettings({ 
                  socialMedia: { 
                    ...settings.socialMedia, 
                    bhyross: { ...settings.socialMedia.bhyross, facebook: e.target.value }
                  }
                })}
                placeholder="https://facebook.com/bhyross"
              />
            </div>
            <div>
              <Label htmlFor="bhyross-instagram">Instagram URL</Label>
              <Input
                id="bhyross-instagram"
                value={settings.socialMedia.bhyross.instagram}
                onChange={(e) => updateSettings({ 
                  socialMedia: { 
                    ...settings.socialMedia, 
                    bhyross: { ...settings.socialMedia.bhyross, instagram: e.target.value }
                  }
                })}
                placeholder="https://instagram.com/bhyross"
              />
            </div>
            <div>
              <Label htmlFor="bhyross-twitter">Twitter URL</Label>
              <Input
                id="bhyross-twitter"
                value={settings.socialMedia.bhyross.twitter}
                onChange={(e) => updateSettings({ 
                  socialMedia: { 
                    ...settings.socialMedia, 
                    bhyross: { ...settings.socialMedia.bhyross, twitter: e.target.value }
                  }
                })}
                placeholder="https://twitter.com/bhyross"
              />
            </div>
            <div>
              <Label htmlFor="bhyross-linkedin">LinkedIn URL</Label>
              <Input
                id="bhyross-linkedin"
                value={settings.socialMedia.bhyross.linkedin}
                onChange={(e) => updateSettings({ 
                  socialMedia: { 
                    ...settings.socialMedia, 
                    bhyross: { ...settings.socialMedia.bhyross, linkedin: e.target.value }
                  }
                })}
                placeholder="https://linkedin.com/company/bhyross"
              />
            </div>
          </div>
        </Card>

        {/* Social Media Settings - DeeCode */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            DeeCode Social Media
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="deecodes-facebook">Facebook URL</Label>
              <Input
                id="deecodes-facebook"
                value={settings.socialMedia.deecodes.facebook}
                onChange={(e) => updateSettings({ 
                  socialMedia: { 
                    ...settings.socialMedia, 
                    deecodes: { ...settings.socialMedia.deecodes, facebook: e.target.value }
                  }
                })}
                placeholder="https://facebook.com/deecodes"
              />
            </div>
            <div>
              <Label htmlFor="deecodes-instagram">Instagram URL</Label>
              <Input
                id="deecodes-instagram"
                value={settings.socialMedia.deecodes.instagram}
                onChange={(e) => updateSettings({ 
                  socialMedia: { 
                    ...settings.socialMedia, 
                    deecodes: { ...settings.socialMedia.deecodes, instagram: e.target.value }
                  }
                })}
                placeholder="https://instagram.com/deecodes"
              />
            </div>
            <div>
              <Label htmlFor="deecodes-twitter">Twitter URL</Label>
              <Input
                id="deecodes-twitter"
                value={settings.socialMedia.deecodes.twitter}
                onChange={(e) => updateSettings({ 
                  socialMedia: { 
                    ...settings.socialMedia, 
                    deecodes: { ...settings.socialMedia.deecodes, twitter: e.target.value }
                  }
                })}
                placeholder="https://twitter.com/deecodes"
              />
            </div>
            <div>
              <Label htmlFor="deecodes-linkedin">LinkedIn URL</Label>
              <Input
                id="deecodes-linkedin"
                value={settings.socialMedia.deecodes.linkedin}
                onChange={(e) => updateSettings({ 
                  socialMedia: { 
                    ...settings.socialMedia, 
                    deecodes: { ...settings.socialMedia.deecodes, linkedin: e.target.value }
                  }
                })}
                placeholder="https://linkedin.com/company/deecodes"
              />
            </div>
          </div>
        </Card>

        {/* Social Media Settings - Imcolus */}
        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Imcolus Social Media
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="imcolus-facebook">Facebook URL</Label>
              <Input
                id="imcolus-facebook"
                value={settings.socialMedia.imcolus.facebook}
                onChange={(e) => updateSettings({ 
                  socialMedia: { 
                    ...settings.socialMedia, 
                    imcolus: { ...settings.socialMedia.imcolus, facebook: e.target.value }
                  }
                })}
                placeholder="https://facebook.com/imcolus"
              />
            </div>
            <div>
              <Label htmlFor="imcolus-instagram">Instagram URL</Label>
              <Input
                id="imcolus-instagram"
                value={settings.socialMedia.imcolus.instagram}
                onChange={(e) => updateSettings({ 
                  socialMedia: { 
                    ...settings.socialMedia, 
                    imcolus: { ...settings.socialMedia.imcolus, instagram: e.target.value }
                  }
                })}
                placeholder="https://instagram.com/imcolus"
              />
            </div>
            <div>
              <Label htmlFor="imcolus-twitter">Twitter URL</Label>
              <Input
                id="imcolus-twitter"
                value={settings.socialMedia.imcolus.twitter}
                onChange={(e) => updateSettings({ 
                  socialMedia: { 
                    ...settings.socialMedia, 
                    imcolus: { ...settings.socialMedia.imcolus, twitter: e.target.value }
                  }
                })}
                placeholder="https://twitter.com/imcolus"
              />
            </div>
            <div>
              <Label htmlFor="imcolus-linkedin">LinkedIn URL</Label>
              <Input
                id="imcolus-linkedin"
                value={settings.socialMedia.imcolus.linkedin}
                onChange={(e) => updateSettings({ 
                  socialMedia: { 
                    ...settings.socialMedia, 
                    imcolus: { ...settings.socialMedia.imcolus, linkedin: e.target.value }
                  }
                })}
                placeholder="https://linkedin.com/company/imcolus"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Save Settings Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex items-center space-x-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>
    </div>
  );
};

export default SettingsTab;