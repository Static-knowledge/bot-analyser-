import { motion } from 'framer-motion';
import { RiskLevel } from '@/types/legal';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

const riskColors: Record<RiskLevel, string> = {
  low: 'hsl(var(--success))',
  medium: 'hsl(var(--warning))',
  high: 'hsl(var(--destructive))',
  critical: 'hsl(var(--destructive))',
};

const riskLabels: Record<RiskLevel, { en: string; hi: string }> = {
  low: { en: 'Low Risk', hi: 'कम जोखिम' },
  medium: { en: 'Medium Risk', hi: 'मध्यम जोखिम' },
  high: { en: 'High Risk', hi: 'उच्च जोखिम' },
  critical: { en: 'Critical', hi: 'गंभीर' },
};

const sizeConfig = {
  sm: { width: 120, height: 80, stroke: 8, fontSize: 'text-xl' },
  md: { width: 180, height: 120, stroke: 12, fontSize: 'text-3xl' },
  lg: { width: 240, height: 160, stroke: 16, fontSize: 'text-5xl' },
};

export function RiskGauge({ score, level, size = 'md' }: RiskGaugeProps) {
  const { language } = useLanguage();
  const config = sizeConfig[size];
  const label = riskLabels[level];

  // SVG arc calculations
  const centerX = config.width / 2;
  const centerY = config.height - 10;
  const radius = Math.min(config.width / 2, config.height) - config.stroke;
  
  // Create arc path (half circle, 180 degrees)
  const startAngle = Math.PI;
  const endAngle = 0;
  const progressAngle = Math.PI - (score / 100) * Math.PI;

  const arcPath = (angle: number) => {
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return `${x} ${y}`;
  };

  const backgroundArc = `M ${arcPath(startAngle)} A ${radius} ${radius} 0 0 1 ${arcPath(endAngle)}`;
  const progressArc = `M ${arcPath(startAngle)} A ${radius} ${radius} 0 0 1 ${arcPath(progressAngle)}`;

  const color = riskColors[level];

  return (
    <div className="flex flex-col items-center">
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={backgroundArc}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={config.stroke}
          strokeLinecap="round"
        />
        
        {/* Progress arc */}
        <motion.path
          d={progressArc}
          fill="none"
          stroke={color}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Score text */}
        <text
          x={centerX}
          y={centerY - 15}
          textAnchor="middle"
          className={cn('font-bold fill-foreground', config.fontSize)}
        >
          {score}
        </text>
      </svg>

      <p className={cn(
        'font-medium mt-2',
        level === 'low' && 'text-success',
        level === 'medium' && 'text-warning',
        (level === 'high' || level === 'critical') && 'text-destructive'
      )}>
        {language === 'en' ? label.en : label.hi}
      </p>
    </div>
  );
}
