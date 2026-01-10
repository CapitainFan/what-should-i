# What Should I

https://what-should-i-six.vercel.app/


"What Should I" это пет проект, призванный помочь пользователям принимать решения, предоставляя персонализированные рекомендации и функции для совместной работы. Приложение включает в себя чат в реальном времени, аутентификацию пользователей и интеллектуальные рекомендации, работающие на основе автоматизированного агента N8N.


---

## Описание проекта

Проект позволяет:
- Регистрироваться и аутентифицироваться.
- Задавать вопросы и общаться с ИИ.
- Менять названия и удалять чаты.
- Просмотр всех пользователей https://what-should-i-six.vercel.app/admin/dashboard

---

## Технологии
### Бэкэнд
- **Epresss Node JS 5.1.0 + TS**
- **JWT + MongoDB**
- **Web Sockets + Redis as Message Broker**
- **N8N agent as AI**

### Фронтенд
- **Next.js 15.3**
- **TypeScript, React 18+**
- **Tailwind CSS v4 + Shadcn UI**
- **Framer Motion — для анимаций**
- **React-Toastify — всплывающие уведомления**

### Деплой
- **Vercel (Next) + Render (Epress Node JS) + Railway (Redis) + MongoDB Atlas Database**