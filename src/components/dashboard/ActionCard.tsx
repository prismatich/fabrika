import { Button, Card, CardBody, CardHeader } from "@heroui/react";

interface ActionCardProps {
    title: string;
    children: React.ReactNode;
}

const ActionCard = ({children, title}: ActionCardProps) => {
  return (
    <Card className="bg-[#f6f4f5] border-0" shadow="none">
      <CardHeader className="font-bold">{title}</CardHeader>
      <CardBody className="flex flex-col gap-2">
        {children}
      </CardBody>
    </Card>
  );
};

export default ActionCard;
