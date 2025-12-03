import { toast as rawToast } from "../hooks/use-toast";

/**
 * Custom toast helpers wrapping the project's toast implementation.
 * Use these instead of window.alert(...) for consistent UX.
 */

function notify({ title, description, variant = "default", duration } = {}) {
  return rawToast({ title, description, variant, duration });
}

function success(description, title = "Sucesso") {
  return notify({ title, description, variant: "default" });
}

function info(description, title = "Informação") {
  return notify({ title, description, variant: "default" });
}

function error(description, title = "Erro") {
  return notify({ title, description, variant: "destructive" });
}

function destructive(description, title = "Erro crítico") {
  return notify({ title, description, variant: "destructive" });
}

export { notify, success, info, error, destructive };

export default { notify, success, info, error, destructive };
