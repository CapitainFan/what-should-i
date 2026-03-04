import { motion } from "framer-motion";


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