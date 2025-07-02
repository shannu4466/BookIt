
export const isExpired = (validUntil: string) => {
  return new Date(validUntil) < new Date();
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
