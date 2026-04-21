type RatingStarsProps = {
  rating: number;
  className?: string;
};

export function RatingStars({ rating, className = "" }: RatingStarsProps) {
  const roundedRating = Math.round(rating);

  return (
    <div
      aria-label={`Рейтинг ${rating.toFixed(1)} из 5`}
      className={`flex items-center gap-1 text-metal ${className}`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} aria-hidden="true">
          {index < roundedRating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}
