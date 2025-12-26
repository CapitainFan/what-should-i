"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion";


type CheckboxAuthProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  onCheck?: () => void;
};

interface AuthSwitchProps {
  isLogin: boolean;
  onToggle: (value: boolean) => void;
}


export function AuthSwitch({ isLogin, onToggle }: AuthSwitchProps) {
  return (
    <div className="relative flex items-center bg-blue-500 rounded-full w-[270px] h-[44px] mx-auto">
      <button
        className={`relative z-10 flex-1 text-center font-bold transition-colors text-[13px] h-full flex items-center justify-center ${
          isLogin ? 'text-black' : 'text-white'
        }`}
        onClick={() => onToggle(true)}
        type="button"
      >
        Login
      </button>
      
      <button
        className={`relative z-10 flex-1 text-center font-bold transition-colors text-[13px] h-full flex items-center justify-center ${
          !isLogin ? 'text-black' : 'text-white'
        }`}
        onClick={() => onToggle(false)}
        type="button"
      >
        Registration
      </button>
      
      <motion.div
        className="absolute bg-white rounded-full w-[117px] h-[28px]"
        style={{
          top: '8px',
          left: '8px',
        }}
        animate={{
          x: isLogin ? 0 : 138,
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 280, 
          damping: 22,
          mass: 0.6
        }}
      />
    </div>
  );
}


export const CheckboxAuth = ({className, onCheck, ...props}: CheckboxAuthProps) => {
  const handleCheckedChange = (checked: CheckboxPrimitive.CheckedState) => {
    if (props.onCheckedChange) {
      props.onCheckedChange(checked);
    }
    
    if (checked === true && onCheck) {
      onCheck();
    }
  };

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-blue-300 data-[state=checked]:border-blue-300 data-[state=checked]:bg-transparent size-5 shrink-0 rounded-[4px] border shadow-xs transition-colors outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
      onCheckedChange={handleCheckedChange}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-blue-600"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}


export const CancelButtonAuth = () => {
  return (
    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 transition-colors">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4L20 20" stroke="#374151" strokeWidth="4" strokeLinecap="round"/>
        <path d="M20 4L4 20" stroke="#374151" strokeWidth="4" strokeLinecap="round"/>
      </svg>
    </div>
  )
}


export const GoogleIcon = () => {
  return(
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30.7917 13.2181L17.7392 13.2174C17.1629 13.2174 16.6957 13.6846 16.6957 14.2609V18.4306C16.6957 19.0069 17.1629 19.4741 17.7392 19.4741H25.0896C24.2847 21.5629 22.7824 23.3123 20.8658 24.4237L24 29.8493C29.0276 26.9416 32 21.8398 32 16.1287C32 15.3155 31.9401 14.7342 31.8202 14.0796C31.7291 13.5823 31.2973 13.2181 30.7917 13.2181Z" fill="#167EE6"></path>
      <path d="M16 25.7391C12.4029 25.7391 9.26263 23.7738 7.57607 20.8654L2.1507 23.9926C4.91163 28.7777 10.0838 32 16 32C18.9023 32 21.6409 31.2186 24 29.8568V29.8493L20.8658 24.4237C19.4322 25.2552 17.7732 25.7391 16 25.7391Z" fill="#12B347"></path>
      <path d="M24 29.8567V29.8493L20.8658 24.4237C19.4322 25.2551 17.7733 25.7391 16 25.7391V32C18.9023 32 21.641 31.2186 24 29.8567Z" fill="#0F993E"></path>
      <path d="M6.26088 16C6.26088 14.2269 6.74475 12.5681 7.57606 11.1346L2.15069 8.00745C0.781375 10.3591 0 13.0903 0 16C0 18.9098 0.781375 21.6409 2.15069 23.9926L7.57606 20.8654C6.74475 19.4319 6.26088 17.7731 6.26088 16Z" fill="#FFD500"></path>
      <path d="M16 6.26088C18.3457 6.26088 20.5003 7.09437 22.1833 8.48081C22.5984 8.82281 23.2019 8.79813 23.5822 8.41781L26.5366 5.46344C26.9681 5.03194 26.9373 4.32562 26.4764 3.92575C23.6567 1.47956 19.9879 0 16 0C10.0838 0 4.91163 3.22231 2.1507 8.00744L7.57607 11.1346C9.26263 8.22625 12.4029 6.26088 16 6.26088Z" fill="#FF4B26"></path>
      <path d="M22.1833 8.48081C22.5984 8.82281 23.2019 8.79813 23.5822 8.41781L26.5366 5.46344C26.968 5.03194 26.9373 4.32562 26.4764 3.92575C23.6567 1.4795 19.9879 0 16 0V6.26088C18.3456 6.26088 20.5003 7.09437 22.1833 8.48081Z" fill="#D93F21"></path>
  </svg>
  )
}


export const AppleIcon = () => {
  return(
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.9986 0C20.2927 0.117999 18.2987 1.20999 17.1367 2.63198C16.0767 3.92198 15.2047 5.83797 15.5447 7.69995C17.4087 7.75795 19.3347 6.63996 20.4506 5.19397C21.4946 3.84798 22.2846 1.94399 21.9986 0Z" fill="white"></path>
    <path d="M28.7406 10.7359C27.1026 8.68195 24.8006 7.48996 22.6266 7.48996C19.7566 7.48996 18.5427 8.86395 16.5487 8.86395C14.4927 8.86395 12.9307 7.49396 10.4487 7.49396C8.01071 7.49396 5.41473 8.98395 3.76874 11.5319C1.45475 15.1199 1.85075 21.8659 5.60073 27.6118C6.94272 29.6678 8.73471 31.9798 11.0787 31.9998C13.1647 32.0198 13.7527 30.6618 16.5787 30.6478C19.4046 30.6318 19.9406 32.0178 22.0226 31.9958C24.3686 31.9778 26.2586 29.4158 27.6006 27.3598C28.5626 25.8859 28.9206 25.1439 29.6666 23.4799C24.2406 21.4139 23.3706 13.6979 28.7406 10.7359Z" fill="white"></path>
  </svg>
  )
}


export const FaceBookIcon = () => {
  return(
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 16C32 23.9862 26.1488 30.6056 18.5 31.8056V20.625H22.2281L22.9375 16H18.5V12.9987C18.5 11.7331 19.12 10.5 21.1075 10.5H23.125V6.5625C23.125 6.5625 21.2938 6.25 19.5431 6.25C15.8888 6.25 13.5 8.465 13.5 12.475V16H9.4375V20.625H13.5V31.8056C5.85125 30.6056 0 23.9862 0 16C0 7.16375 7.16375 0 16 0C24.8363 0 32 7.16375 32 16Z" fill="#1877F2"></path>
    <path d="M22.2281 20.625L22.9375 16H18.5V12.9987C18.5 11.7334 19.1199 10.5 21.1074 10.5H23.125V6.5625C23.125 6.5625 21.294 6.25 19.5434 6.25C15.8887 6.25 13.5 8.465 13.5 12.475V16H9.4375V20.625H13.5V31.8056C14.3146 31.9334 15.1495 32 16 32C16.8505 32 17.6854 31.9334 18.5 31.8056V20.625H22.2281Z" fill="white"></path>
  </svg>
  )
}


export const DiskordIcon = () => {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="clip0">
          <rect width="32" height="32" rx="16" fill="white" />
        </clipPath>
      </defs>
      
      <rect width="32" height="32" rx="16" fill="#5C6BC0" />
      <g clipPath="url(#clip0)">
        <circle cx="16.5" cy="17.5" r="11.5" fill="white" />
        <path d="M4.7735 29.2613H23.7855L25 33C25.1347 33.1173 30.6668 33 30.6668 33V4.3C30.5762 2.516 29.0402 1 27.1362 1L4.78016 1.004C2.8775 1.004 1.3335 2.52267 1.3335 4.30667V25.96C1.3335 27.8413 2.87483 29.2613 4.7735 29.2613ZM18.8375 8.57733L18.7935 8.59333L18.8095 8.57733H18.8375ZM8.66283 10.2693C11.1068 8.49067 13.3722 8.576 13.3722 8.576L13.5548 8.756C10.5642 9.46933 9.20816 10.8053 9.20816 10.8053C9.34683 10.776 15.3855 7.292 22.7028 10.8933C22.7028 10.8933 21.3442 9.644 18.5375 8.844L18.7855 8.6C19.1735 8.60133 21.2268 8.67333 23.4242 10.28C23.4242 10.28 25.8828 14.48 25.8828 19.64C25.8015 19.5413 24.3575 21.8613 20.6415 21.9413C20.6415 21.9413 20.0122 21.2293 19.5642 20.608C21.7375 19.984 22.5508 18.736 22.5508 18.736C18.3202 21.4 14.6122 20.984 10.1762 19.184C10.1348 19.184 10.1162 19.1653 10.0948 19.144V19.136C10.0735 19.116 10.0548 19.096 10.0135 19.096H9.9335C9.6615 18.9173 9.48016 18.8293 9.48016 18.8293C9.48016 18.8293 10.2922 20.0773 12.3788 20.7013C11.8308 21.3267 11.2882 22.0373 11.2882 22.0373C7.5735 21.9493 6.21883 19.6293 6.21883 19.6293C6.21883 14.4613 8.66283 10.2693 8.66283 10.2693Z" fill="#5C6BC0" />
        <path d="M19.0775 18.028C20.0255 18.028 20.7975 17.228 20.7975 16.2413C20.7975 15.2613 20.0295 14.4613 19.0775 14.4613V14.4653C18.1335 14.4653 17.3602 15.2627 17.3575 16.2493C17.3575 17.228 18.1295 18.028 19.0775 18.028Z" fill="#5C6BC0" />
        <path d="M12.9202 18.028C13.8682 18.028 14.6402 17.228 14.6402 16.2413C14.6402 15.2613 13.8735 14.4613 12.9255 14.4613L12.9202 14.4653C11.9722 14.4653 11.2002 15.2627 11.2002 16.2493C11.2002 17.228 11.9722 18.028 12.9202 18.028Z" fill="#5C6BC0" />
      </g>
    </svg>
  );
};


export const TelegramIcon = () => {
  return(
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#039BE5"></path>
    <path d="M7.32132 15.6533L22.748 9.70534C23.464 9.44667 24.0893 9.88 23.8573 10.9627L23.8587 10.9613L21.232 23.336C21.0373 24.2133 20.516 24.4267 19.7867 24.0133L15.7867 21.0653L13.8573 22.924C13.644 23.1373 13.464 23.3173 13.0507 23.3173L13.3347 19.2467L20.748 12.5493C21.0707 12.2653 20.676 12.1053 20.2507 12.388L11.0893 18.156L7.13998 16.924C6.28265 16.652 6.26398 16.0667 7.32132 15.6533Z" fill="white"></path>
  </svg>
  )
}