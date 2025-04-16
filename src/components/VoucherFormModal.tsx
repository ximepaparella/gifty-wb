import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Template1, Template2, Template3, Template4, Template5 } from './templates';
import { Mail, User, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { storeService } from '@/lib/api/services';
import type { Store } from '@/lib/api/types';

export interface VoucherData {
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  message: string;
  template: string;
  productName: string;
  storeName: string;
  storeAddress: string;
  storeEmail: string;
  storePhone: string;
  storeSocial: string;
  storeLogo: string;
  expirationDate: string;
  code: string;
  qrCode: string;
}

interface VoucherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    store: string;
    storeId: string;
    price: number;
    image: string;
  };
}

interface ValidationError {
  field: string;
  message: string;
}

const VoucherFormModal: React.FC<VoucherFormModalProps> = ({ isOpen, onClose, product }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [storeData, setStoreData] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [voucherData, setVoucherData] = useState<VoucherData>({
    sender_name: '',
    sender_email: '',
    receiver_name: '',
    receiver_email: '',
    message: '',
    template: '1',
    productName: product.name,
    storeName: product.store,
    storeAddress: '',
    storeEmail: '',
    storePhone: '',
    storeSocial: '',
    storeLogo: '/placeholder.svg',
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    code: 'GIFT' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    qrCode: 'https://www.researchgate.net/profile/Venkata-Pabolu/publication/332942465/figure/fig1/AS:763007793651712@1558926642965/QR-code-for-the-web-link.ppm'
  });

  // Fetch store data when component mounts
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const store = await storeService.getById(product.storeId);
        setStoreData(store);
        
        // Format social media links into a string
        const socialLinks = [];
        if (store.social.instagram) socialLinks.push(`Instagram: ${store.social.instagram}`);
        if (store.social.facebook) socialLinks.push(`Facebook: ${store.social.facebook}`);
        if (store.social.tiktok) socialLinks.push(`TikTok: ${store.social.tiktok}`);
        if (store.social.youtube) socialLinks.push(`YouTube: ${store.social.youtube}`);
        if (store.social.others?.length > 0) {
          store.social.others.forEach(other => {
            socialLinks.push(`${other.name}: ${other.url}`);
          });
        }
        const socialString = socialLinks.join(' | ');
        
        // Update voucher data with store information
        setVoucherData(prev => ({
          ...prev,
          storeName: store.name,
          storeAddress: store.address || '',
          storeEmail: store.email || '',
          storePhone: store.phone || '',
          storeSocial: socialString,
          storeLogo: store.logo || '/placeholder.svg'
        }));
      } catch (error) {
        console.error('Failed to fetch store data:', error);
        toast({
          title: "Error",
          description: "Failed to load store information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && product.storeId) {
      fetchStoreData();
    }
  }, [isOpen, product.storeId, toast]);

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];

    // Name validations
    if (!voucherData.sender_name.trim()) {
      newErrors.push({ field: 'sender_name', message: 'Sender name is required' });
    } else if (voucherData.sender_name.trim().length < 2) {
      newErrors.push({ field: 'sender_name', message: 'Sender name must be at least 2 characters long' });
    } else if (!/^[a-zA-Z\s'-]+$/.test(voucherData.sender_name.trim())) {
      newErrors.push({ field: 'sender_name', message: 'Sender name can only contain letters, spaces, hyphens, and apostrophes' });
    }

    if (!voucherData.receiver_name.trim()) {
      newErrors.push({ field: 'receiver_name', message: 'Recipient name is required' });
    } else if (voucherData.receiver_name.trim().length < 2) {
      newErrors.push({ field: 'receiver_name', message: 'Recipient name must be at least 2 characters long' });
    } else if (!/^[a-zA-Z\s'-]+$/.test(voucherData.receiver_name.trim())) {
      newErrors.push({ field: 'receiver_name', message: 'Recipient name can only contain letters, spaces, hyphens, and apostrophes' });
    }

    // Email validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!voucherData.sender_email.trim()) {
      newErrors.push({ field: 'sender_email', message: 'Sender email is required' });
    } else if (!emailRegex.test(voucherData.sender_email.trim())) {
      newErrors.push({ field: 'sender_email', message: 'Please enter a valid sender email address' });
    }

    if (!voucherData.receiver_email.trim()) {
      newErrors.push({ field: 'receiver_email', message: 'Recipient email is required' });
    } else if (!emailRegex.test(voucherData.receiver_email.trim())) {
      newErrors.push({ field: 'receiver_email', message: 'Please enter a valid recipient email address' });
    }

    // Message validation
    if (!voucherData.message.trim()) {
      newErrors.push({ field: 'message', message: 'Message is required' });
    } else if (voucherData.message.trim().length < 10) {
      newErrors.push({ field: 'message', message: 'Message must be at least 10 characters long' });
    } else if (voucherData.message.trim().length > 500) {
      newErrors.push({ field: 'message', message: 'Message cannot exceed 500 characters' });
    }

    // Template validation
    if (!voucherData.template) {
      newErrors.push({ field: 'template', message: 'Please select a template' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVoucherData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user types
    setErrors(prev => prev.filter(error => error.field !== name));
  };

  const handleTemplateChange = (value: string) => {
    setVoucherData(prev => ({
      ...prev,
      template: value
    }));
    setErrors(prev => prev.filter(error => error.field !== 'template'));
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  const handleContinue = () => {
    if (!validateForm()) {
      if (errors.length > 0) {
        toast({
          title: "Validation Error",
          description: errors[0].message,
          variant: "destructive"
        });
      }
      return;
    }

    // Add to cart with personalized details
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      store: storeData?.name || product.store,
      storeId: product.storeId,
      voucherData: {
        senderName: voucherData.sender_name.trim(),
        senderEmail: voucherData.sender_email.trim(),
        receiverName: voucherData.receiver_name.trim(),
        receiverEmail: voucherData.receiver_email.trim(),
        message: voucherData.message.trim(),
        template: voucherData.template,
        expirationDate: voucherData.expirationDate
      }
    });
    
    toast({
      title: "Voucher personalized!",
      description: "Proceeding to checkout...",
    });
    
    onClose();
    navigate('/checkout');
  };

  const renderTemplatePreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gifty-500" />
        </div>
      );
    }

    const commonProps = {
      ...voucherData,
      storeName: storeData?.name || voucherData.storeName,
      storeAddress: storeData?.address || voucherData.storeAddress,
      storeEmail: storeData?.email || voucherData.storeEmail,
      storePhone: storeData?.phone || voucherData.storePhone,
      storeSocial: voucherData.storeSocial,
      storeLogo: storeData?.logo || voucherData.storeLogo,
    };

    switch (voucherData.template) {
      case '1':
        return <Template1 {...commonProps} />;
      case '2':
        return <Template2 {...commonProps} />;
      case '3':
        return <Template3 {...commonProps} />;
      case '4':
        return <Template4 {...commonProps} />;
      case '5':
        return <Template5 {...commonProps} />;
      default:
        return <Template1 {...commonProps} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personalize Your Gift Voucher</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 py-4">
          <div className="lg:col-span-3 space-y-4">
            <div>
              <Label className="flex items-center gap-2 mb-1.5">
                <User className="h-4 w-4 text-gifty-500" />
                <span>From (Your Name) *</span>
              </Label>
              <Input 
                name="sender_name"
                value={voucherData.sender_name}
                onChange={handleInputChange}
                placeholder="Your name"
                className={getFieldError('sender_name') ? 'border-red-500' : ''}
              />
              {getFieldError('sender_name') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('sender_name')}</p>
              )}
            </div>
            
            <div>
              <Label className="flex items-center gap-2 mb-1.5">
                <Mail className="h-4 w-4 text-gifty-500" />
                <span>Your Email *</span>
              </Label>
              <Input 
                name="sender_email"
                value={voucherData.sender_email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                type="email"
                className={getFieldError('sender_email') ? 'border-red-500' : ''}
              />
              {getFieldError('sender_email') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('sender_email')}</p>
              )}
            </div>
            
            <div>
              <Label className="flex items-center gap-2 mb-1.5">
                <User className="h-4 w-4 text-gifty-500" />
                <span>To (Recipient's Name) *</span>
              </Label>
              <Input 
                name="receiver_name"
                value={voucherData.receiver_name}
                onChange={handleInputChange}
                placeholder="Recipient's name"
                className={getFieldError('receiver_name') ? 'border-red-500' : ''}
              />
              {getFieldError('receiver_name') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('receiver_name')}</p>
              )}
            </div>
            
            <div>
              <Label className="flex items-center gap-2 mb-1.5">
                <Mail className="h-4 w-4 text-gifty-500" />
                <span>Recipient's Email *</span>
              </Label>
              <Input 
                name="receiver_email"
                value={voucherData.receiver_email}
                onChange={handleInputChange}
                placeholder="recipient.email@example.com"
                type="email"
                className={getFieldError('receiver_email') ? 'border-red-500' : ''}
              />
              {getFieldError('receiver_email') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('receiver_email')}</p>
              )}
            </div>
            
            <div>
              <Label className="block mb-1.5">Personal Message *</Label>
              <Textarea 
                name="message"
                value={voucherData.message}
                onChange={handleInputChange}
                placeholder="Add a personal message for the recipient..."
                rows={4}
                className={getFieldError('message') ? 'border-red-500' : ''}
              />
              {getFieldError('message') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('message')}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {500 - voucherData.message.length} characters remaining
              </p>
            </div>
            
            <div>
              <Label className="block mb-1.5">Template Style *</Label>
              <Select 
                value={voucherData.template} 
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className={getFieldError('template') ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a template style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Classic Black</SelectItem>
                  <SelectItem value="2">Purple Elegance</SelectItem>
                  <SelectItem value="3">Gradient Purple</SelectItem>
                  <SelectItem value="4">Golden Luxury</SelectItem>
                  <SelectItem value="5">Blue Modern</SelectItem>
                </SelectContent>
              </Select>
              {getFieldError('template') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('template')}</p>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-7">
            <h3 className="text-xl font-medium mb-4">Voucher Preview</h3>
            <div className="mt-4 rounded-lg border overflow-hidden">
              {renderTemplatePreview()}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            className="bg-gifty-500 hover:bg-gifty-600 text-white"
            onClick={handleContinue}
          >
            Continue to Checkout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VoucherFormModal;
