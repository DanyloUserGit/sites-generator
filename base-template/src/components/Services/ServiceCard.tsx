type ServiceCardProps = {
  title: string;
  description: string;
};

export default function ServiceCard({ title, description }: ServiceCardProps) {
  return (
    <div className="bg-white shadow-card rounded-xl p-6 text-center">
      <h2 className="text-xl font-semibold text-primary mb-4">{title}</h2>
      <p className="text-gray-dark">{description}</p>
    </div>
  );
}
