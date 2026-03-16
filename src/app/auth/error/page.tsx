import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

interface ErrorPageProps {
  searchParams: Promise<{ error?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied:
    "Este email não tem acesso ao TaskBoard. Apenas a equipe Yesode autorizada pode acessar.",
  Configuration: "Erro de configuração. Entre em contato com o administrador.",
  Default: "Ocorreu um erro ao fazer login. Tente novamente.",
};

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams;
  const error = params.error || "Default";
  const message = ERROR_MESSAGES[error] || ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-8 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Acesso negado</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Link href="/auth/signin" className={buttonVariants({ variant: "outline" })}>
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
