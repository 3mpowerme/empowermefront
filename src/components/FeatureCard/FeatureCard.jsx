import Button from '../Button/Button';

export default function FeatureCard({
  img,
  title,
  subtitle,
  description,
  reverse,
  className = '',
  imgClassName = '',
  button = null,
}) {
  return (
    <section className={`max-w-8xl ${className}`}>
      <div
        className={`px-6 max-w-7xl mx-auto grid md:grid-cols-2 items-center ${
          reverse ? 'direction-rtl' : 'direction-ltr'
        }`}>
        <img src={img} alt={title} className={imgClassName} />
        <div className="flex flex-col items-end">
          <h1 className="text-3xl font-bold mb-4 text-black">{title}</h1>
          <h2 className="text-xl font-bold mb-4 text-black">{subtitle}</h2>
          <p className="text-black text-left">{description}</p>
          {button && (
            <Button className="mt-5" onClick={button?.onClick}>
              {button?.text}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
