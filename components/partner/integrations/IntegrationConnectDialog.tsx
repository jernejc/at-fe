'use client';

import { useState } from 'react';
import { ExternalLink, Loader2, Plug } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Integration } from './integrations-data';

interface IntegrationConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: Integration | null;
  onConnect: (integrationId: string) => void;
}

function DialogForm({
  integration,
  onConnect,
  onOpenChange,
}: {
  integration: Integration;
  onConnect: (integrationId: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imgError, setImgError] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of integration.connectionFields) {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConnect = async () => {
    if (!validateForm()) return;

    setConnecting(true);
    // Simulate API call delay for demo
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setConnecting(false);
    onConnect(integration.id);
    onOpenChange(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg flex items-center gap-2">
          Connect {integration.name}
        </DialogTitle>
        <DialogDescription>
          Enter your credentials to connect with {integration.name}.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {/* Integration info box */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            {imgError ? (
              <Plug className="w-5 h-5 text-slate-400" />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={integration.logoUrl}
                alt={`${integration.name} logo`}
                className="w-8 h-8 object-contain"
                onError={() => setImgError(true)}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {integration.name}
            </p>
            <a
              href={integration.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              {integration.website.replace(/^https?:\/\//, '')}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Dynamic form fields */}
        {integration.connectionFields.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              aria-invalid={!!errors[field.name]}
            />
            {field.helpText && !errors[field.name] && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {field.helpText}
              </p>
            )}
            {errors[field.name] && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={connecting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConnect}
          disabled={connecting}
          className="gap-2"
        >
          {connecting && <Loader2 className="w-4 h-4 animate-spin" />}
          Connect
        </Button>
      </DialogFooter>
    </>
  );
}

export function IntegrationConnectDialog({
  open,
  onOpenChange,
  integration,
  onConnect,
}: IntegrationConnectDialogProps) {
  if (!integration) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" key={integration.id}>
        <DialogForm
          integration={integration}
          onConnect={onConnect}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
