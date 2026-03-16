import { Mail, Phone, Video, MessageSquare } from 'lucide-react';
import { LinkedinIcon } from '@/components/ui/icons/linkedin-icon';
import { cn } from '@/lib/utils';

interface ChannelIconProps {
  channel: string;
  className?: string;
}

/** Returns the matching icon for a channel name. */
export function ChannelIcon({ channel, className = 'w-4 h-4' }: ChannelIconProps) {
  const classes = cn(className, 'shrink-0');

  switch (channel) {
    case 'email': return <Mail className={classes} />;
    case 'linkedin': return <LinkedinIcon className={classes} />;
    case 'phone': return <Phone className={classes} />;
    case 'video': return <Video className={classes} />;
    case 'virtual_workshop': return <Video className={classes} />;
    default: return <MessageSquare className={classes} />;
  }
}
