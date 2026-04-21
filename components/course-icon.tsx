import {
  Sparkles,
  Code,
  HeartPulse,
  Shield,
  Bot,
  Brain,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Code,
  HeartPulse,
  Shield,
  Bot,
  Brain,
};

export function CourseIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name] || Sparkles;
  return <Icon className={className} />;
}
