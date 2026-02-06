import { cn } from '@/lib/utils';
import { Shield, AlertTriangle, AlertCircle, XCircle } from 'lucide-react';
import { RiskLevel } from '@/types/legal';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const riskConfig: Record<RiskLevel, {
  label: string;
  labelHi: string;
  icon: typeof Shield;
  className: string;
}> = {
  low: {
    label: 'Low Risk',
    labelHi: 'कम जोखिम',
    icon: Shield,
    className: 'risk-low',
  },
  medium: {
    label: 'Medium Risk',
    labelHi: 'मध्यम जोखिम',
    icon: AlertTriangle,
    className: 'risk-medium',
  },
  high: {
    label: 'High Risk',
    labelHi: 'उच्च जोखिम',
    icon: AlertCircle,
    className: 'risk-high',
  },
  critical: {
    label: 'Critical',
    labelHi: 'गंभीर',
    icon: XCircle,
    className: 'risk-critical',
  },
};

const sizeConfig = {
  sm: {
    badge: 'px-2 py-0.5 text-xs',
    icon: 'h-3 w-3',
  },
  md: {
    badge: 'px-2.5 py-1 text-sm',
    icon: 'h-4 w-4',
  },
  lg: {
    badge: 'px-3 py-1.5 text-base',
    icon: 'h-5 w-5',
  },
};

export function RiskBadge({ level, score, size = 'md', showLabel = true }: RiskBadgeProps) {
  const config = riskConfig[level];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.className,
        sizeStyles.badge
      )}
    >
      <Icon className={sizeStyles.icon} />
      {showLabel && <span>{config.label}</span>}
      {score !== undefined && <span>({score})</span>}
    </span>
  );
}
