import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';
import { IoTrashOutline } from 'react-icons/io5';

interface DeleteChatDialogProps {
  chatId: string;
  onDelete: (chatId: string) => void;
}

export const DeleteChatDialog = ({ chatId, onDelete }: DeleteChatDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-red-500 hover:bg-red-600 h-9 w-9 text-white rounded-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <IoTrashOutline />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gray-200">
        <AlertDialogHeader>
          <AlertDialogTitle>Точно хотите удалить этот чат?</AlertDialogTitle>
          <AlertDialogDescription>
            Это действие необратимо. Оно навсегда удалит этот чат!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="focus-visible:ring-0 focus:outline-none">
            Вернуться
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDelete(chatId)}
            className="bg-red-500 hover:bg-red-700 text-white"
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};