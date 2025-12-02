import RiskBadge from '../RiskBadge';

export default function RiskBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <RiskBadge level="low" />
      <RiskBadge level="emerging" />
      <RiskBadge level="elevated" />
      <RiskBadge level="immediate" />
      <RiskBadge level="critical" />
    </div>
  );
}
