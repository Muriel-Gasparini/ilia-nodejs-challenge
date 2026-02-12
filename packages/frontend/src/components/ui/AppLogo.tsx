import { useTranslation } from 'react-i18next';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const sizes = {
  sm: 24,
  md: 28,
  lg: 40,
};

export function AppLogo({ size = 'md', showName = true }: AppLogoProps) {
  const { t } = useTranslation();
  const px = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <svg width={px} height={px} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#49cc68" />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontWeight="700"
          fontSize="18"
          fill="white"
        >
          U
        </text>
      </svg>
      {showName && <span className="text-lg font-bold">{t('appName')}</span>}
    </div>
  );
}
