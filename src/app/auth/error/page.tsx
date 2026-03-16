import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

interface ErrorPageProps {
  searchParams: Promise<{ error?: string; email?: string }>;
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
  const email = params.email;
  const message = ERROR_MESSAGES[error] || ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-8 text-center">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Ocorreu um erro</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          {email && error === "AccessDenied" && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <span className="font-medium">O email: </span>
              <span className="font-bold text-destructive">{email}</span>
              <br />
              <span className="font-medium">não está autorizado.</span>
            </div>
          )}
          {!email && error === "Configuration" && (
            <div className="rounded-md bg-muted p-3 text-xs text-left">
              <span className="font-medium">Atenção: </span>O erro de configuração (Configuration Error) ocorre no servidor antes do processo de login concluir. Portanto, o provedor ainda não repassou seu email para o sistema. Verifique as variáveis de ambiente no servidor onde a aplicação está hospedada.
            </div>
          )}
        </div>
        <Link href="/auth/signin" className={buttonVariants({ variant: "outline" })}>
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
