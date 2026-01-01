'use client'

import { CustomTextarea } from "@/components/ui/customTextarea"

export default function NewChat() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center bg-gray-200 w-250 h-[calc(100vh-152px)] rounded-3xl mt-10">
        <div className="absolute inset-0 flex items-center justify-center p-5">
          <div className="font-bold text-[17px]">
            New Chat. Ask What Should You Do!
          </div>
          <CustomTextarea
            placeholder="Введите запрос"
            className="absolute bottom-[15px]"
          />
        </div>
      </div>
    </div>
  )
}