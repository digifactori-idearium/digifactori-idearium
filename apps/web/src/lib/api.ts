export const handleApiError = (error: any): never => {
  if (error.response?.data) {
    const data = error.response.data;

    const message = data?.errors?.[0]
      ? `${data.errors[0].field ? data.errors[0].field + ':' : ''} ${data.errors[0].message}`
      : data?.error?.message ||
        data?.message ||
        "Une erreur inattendue s'est produite.";

    throw new Error(message);
  }

  throw new Error('Erreur réseau');
};
