import { SignUp } from "@clerk/nextjs"
import { AuthShell } from "@/components/auth/auth-shell"

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <SignUp
        forceRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: "#4338CA",
            borderRadius: "0.625rem",
          },
          elements: {
            rootBox: "w-full",
            cardBox: "shadow-none w-full",
            card: "shadow-none border-0 p-0 w-full bg-transparent",
            headerTitle: "font-heading text-2xl font-bold tracking-tight",
            headerSubtitle: "text-muted-foreground text-sm",
            socialButtonsBlockButton:
              "border border-border bg-background hover:bg-accent text-foreground shadow-none transition-colors",
            socialButtonsBlockButtonText: "font-medium text-sm",
            dividerLine: "bg-border",
            dividerText: "text-muted-foreground text-xs",
            formFieldLabel: "text-foreground text-sm font-medium",
            formFieldInput:
              "border-input bg-background text-foreground shadow-none",
            formButtonPrimary:
              "bg-primary hover:bg-primary/90 text-primary-foreground shadow-none text-sm font-medium h-10",
            footerAction: "hidden",
            identityPreview:
              "border border-border bg-muted rounded-lg",
            identityPreviewText: "text-foreground text-sm",
            identityPreviewEditButton: "text-primary text-sm",
            formFieldAction: "text-primary text-sm",
            otpCodeFieldInput: "border-input",
            alert: "border border-border bg-muted text-sm rounded-lg",
            alertText: "text-foreground",
            formFieldWarningText: "text-destructive text-xs",
            formFieldErrorText: "text-destructive text-xs",
          },
        }}
      />
    </AuthShell>
  )
}
