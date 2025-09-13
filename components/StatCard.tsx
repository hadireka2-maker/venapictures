import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  iconBgColor?: string;
  iconColor?: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
    icon, 
    title, 
    value, 
    change, 
    changeType,
    iconBgColor = 'bg-gray-700/50', 
    iconColor = 'text-brand-text-primary',
    subtitle
}) => {
  
  const changeColor = changeType === 'increase' ? 'text-brand-success' : 'text-brand-danger';

  const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
  );

  const TrendingDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/>
          <polyline points="16 17 22 17 22 11"/>
      </svg>
  );

  return (
    <div className="
      bg-brand-surface 
      p-3 sm:p-4 md:p-6 
      rounded-2xl 
      flex items-start 
      gap-3 sm:gap-4 md:gap-5 
      shadow-soft
      border border-brand-border/50 
      hover:shadow-lg 
      hover:shadow-brand-accent/5
      hover:border-brand-border
      hover:-translate-y-0.5
      transition-all duration-300 ease-out
      group
      backdrop-blur-sm
      relative
      overflow-hidden
    ">
      {/* Subtle background gradient on hover */}
      <div className="
        absolute inset-0 
        bg-gradient-to-br 
        from-brand-accent/0 
        to-brand-accent/0 
        group-hover:from-brand-accent/2 
        group-hover:to-transparent 
        transition-all duration-300
        pointer-events-none
      " />
      
      {/* Enhanced Icon Container */}
      <div className={`
        w-12 h-12 
        sm:w-14 sm:h-14 
        md:w-16 md:h-16 
        rounded-2xl
        flex items-center justify-center 
        flex-shrink-0 
        ${iconBgColor} ${iconColor}
        shadow-sm
        group-hover:scale-105
        transition-all duration-300
        relative
        overflow-hidden
      `}>
        {/* Icon background shimmer effect */}
        <div className="
          absolute inset-0 
          bg-gradient-to-r 
          from-transparent 
          via-white/10 
          to-transparent 
          -translate-x-full 
          group-hover:translate-x-full 
          transition-transform duration-1000
        " />
        <div className="
          w-5 h-5 
          sm:w-6 sm:h-6 
          md:w-7 md:h-7
          relative z-10
        ">
          {icon}
        </div>
      </div>
      
      {/* Enhanced Content Area */}
      <div className="flex-grow overflow-hidden min-w-0 relative z-10">
        <p className="
          text-xs sm:text-sm 
          text-brand-text-secondary 
          font-medium 
          truncate
          mb-1 sm:mb-2
          leading-tight
        ">
          {title}
        </p>
        
        <div className="flex items-end gap-2 flex-wrap mb-1">
          <p className="
            text-lg sm:text-xl md:text-2xl lg:text-3xl 
            font-bold 
            text-brand-text-light 
            break-words 
            leading-none
            group-hover:text-brand-accent
            transition-colors duration-300
          ">
            {value}
          </p>
          
          {change && (
            <div className={`
              flex items-center 
              text-xs sm:text-sm 
              font-semibold 
              ${changeColor}
              gap-1
              bg-white/50
              dark:bg-black/20
              px-2 py-1
              rounded-full
              shadow-sm
            `}>
              {changeType === 'increase' ? (
                <TrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <TrendingDownIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        
        {subtitle && (
          <p className="
            text-xs sm:text-sm 
            text-brand-text-secondary 
            mt-1 sm:mt-2
            line-clamp-2
            leading-tight
          ">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Corner accent */}
      <div className="
        absolute top-0 right-0 
        w-8 h-8 
        bg-gradient-to-bl 
        from-brand-accent/10 
        to-transparent 
        opacity-0 
        group-hover:opacity-100 
        transition-opacity duration-300
      " />
    </div>
  );
};

export default StatCard;