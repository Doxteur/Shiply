import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { login } from "@/app/features/auth/authSlice";
import { RootState, AppDispatch } from "@/app/store";
import { useNavigate, useLocation } from "react-router";

function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (formData: FormData): boolean => {
    const errors: { email?: string; password?: string } = {};
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validation email
    if (!email) {
      errors.email = "L'adresse e-mail est requise";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = "Adresse e-mail invalide";
    }

    // Validation password
    if (!password) {
      errors.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});

    const formData = new FormData(e.currentTarget);

    if (!validateForm(formData)) {
      return;
    }

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Dispatch de l'action de login
    dispatch(login({ email, password }))
      .unwrap()
      .then((response) => {
        console.log('Connexion réussie:', response);
        // Redirection seulement en cas de succès
        const from = location.state?.from || "/";
        navigate(from, { replace: true });
      })
      .catch((error) => {
        console.error('Erreur de connexion:', error);
        // Pas de redirection en cas d'erreur
      });
  };

  // Redirection après connexion réussie (seulement si authentifié)
  useEffect(() => {
    if (isAuthenticated && !loading && !error) {
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, error, navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
            >
              <Lock className="w-8 h-8 text-primary" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Connexion
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Connectez-vous à votre compte
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Affichage des erreurs */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <span className="text-sm text-destructive">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-2"
              >
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-card-foreground"
                >
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`w-full pl-10 pr-4 py-3 bg-input/50 border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all duration-200 ${
                      formErrors.email
                        ? "border-destructive"
                        : "border-border/50"
                    }`}
                    placeholder="exemple@email.com"
                    disabled={loading}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.email}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="space-y-2"
              >
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-card-foreground"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-10 pr-12 py-3 bg-input/50 border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all duration-200 ${
                      formErrors.password
                        ? "border-destructive"
                        : "border-border/50"
                    }`}
                    placeholder="Votre mot de passe"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors duration-200 disabled:opacity-50"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.password}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex items-center justify-between text-sm"
              >
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-ring focus:ring-2"
                    disabled={loading}
                  />
                  <span className="text-muted-foreground">
                    Se souvenir de moi
                  </span>
                </label>
                <a
                  href="#"
                  className="text-primary hover:text-primary/80 transition-colors duration-200"
                >
                  Mot de passe oublié ?
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className=" hover:cursor-pointer w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-center text-sm text-muted-foreground"
            >
              Pas encore de compte ?{" "}
              <a
                href="#"
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
              >
                Créer un compte
              </a>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default LoginForm;
