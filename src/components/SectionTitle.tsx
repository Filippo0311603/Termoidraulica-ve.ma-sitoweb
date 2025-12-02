import { COLORS } from '../utils/constants';

interface SectionTitleProps {
    title: string;
    subtitle?: string;
    centered?: boolean;
    light?: boolean;
}

const SectionTitle = ({ title, subtitle, centered = true, light = false }: SectionTitleProps) => (
    <div className={`mb-12 reveal ${centered ? 'text-center' : 'text-left'}`}>
        <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${light ? 'text-white' : COLORS.primary}`}>
            {title}
        </h2>
        <div className={`h-1.5 w-20 ${COLORS.secondaryBg} rounded-full mb-6 ${centered ? 'mx-auto' : ''}`}></div>
        {subtitle && <p className={`text-lg ${light ? 'text-gray-300' : 'text-gray-600'} max-w-2xl ${centered ? 'mx-auto' : ''}`}>{subtitle}</p>}
    </div>
);

export default SectionTitle;
