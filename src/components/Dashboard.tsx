import {
  Avatar,
  Button,
  Calendar,
  Card,
  CardBody,
  CardHeader,
  HeroUIProvider,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import {
  BarChart3,
  ClipboardList,
  KeyRound,
  Menu,
  Package,
  Repeat,
  ShoppingCart,
  User,
} from "lucide-react";
import React from "react";

const Dashboard: React.FC = () => {
  const menuItems = [
    { icon: BarChart3, label: "Estadísticas" },
    { icon: Package, label: "Inventario" },
    { icon: ClipboardList, label: "Pedidos" },
    { icon: ShoppingCart, label: "Compras" },
    { icon: Repeat, label: "Movimientos" },
    { icon: User, label: "Usuarios" },
    { icon: Menu, label: "Registros" },
    { icon: KeyRound, label: "Administración" },
  ];

  return (
    <HeroUIProvider>
      <div className="flex h-screen bg-[#F6F4F4]">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md p-4 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-primary mb-4">Prismatich</h1>
          <nav className="flex flex-col gap-2">
            {menuItems.map(({ icon: Icon, label }) => (
              <Button
                key={label}
                variant="light"
                className="flex items-center gap-3 justify-start hover:bg-gray-100"
              >
                <Icon size={20} />
                {label}
              </Button>
            ))}
          </nav>
        </aside>


        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between bg-white shadow px-6 py-4">
            <h2 className="text-lg font-semibold">Bienvenido a SCI</h2>
            <div className="flex items-center gap-4">
              <Input placeholder="Buscar..." size="sm" className="w-48" />
              <Avatar name="Admin" />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 bg-[#F6F4F4]">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[
                { title: "Inventario", text: "Agregar material" },
                { title: "Proveedores", text: "Registrar proveedor" },
                { title: "Usuarios", text: "Invitar usuario" },
                { title: "Clientes", text: "Registrar cliente" },
              ].map((item, idx) => (
                <Card
                  key={idx}
                  className="shadow hover:shadow-lg transition bg-white"
                >
                  <CardHeader className="font-bold">{item.title}</CardHeader>
                  <CardBody>{item.text}</CardBody>
                </Card>
              ))}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-2 h-56 shadow bg-white">
                <CardHeader className="font-bold">Activos vs Pasivos</CardHeader>
                <CardBody className="flex items-center justify-center text-gray-500">
                  📈 Aquí iría tu gráfico
                </CardBody>
              </Card>

              <Card className="h-56 shadow bg-white">
                <CardHeader className="font-bold">Calendario</CardHeader>
                <CardBody className="flex justify-center">
                  <Calendar aria-label="Calendario" />
                </CardBody>
              </Card>
            </section>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="h-56 shadow bg-white">
                <CardHeader className="font-bold">Producción</CardHeader>
                <CardBody className="flex items-center justify-center text-gray-500">
                  Barras o progreso aquí
                </CardBody>
              </Card>

              <Card className="h-56 shadow bg-white">
                <CardHeader className="font-bold">Análisis</CardHeader>
                <CardBody className="flex items-center justify-center text-gray-500">
                  KPI o CircularProgress aquí
                </CardBody>
              </Card>
            </section>

            <Card className="shadow bg-white">
              <CardHeader className="font-bold">Últimos Movimientos</CardHeader>
              <CardBody>
                <Table aria-label="Últimos movimientos">
                  <TableHeader>
                    <TableColumn>Fecha</TableColumn>
                    <TableColumn>Descripción</TableColumn>
                    <TableColumn>Monto</TableColumn>
                    <TableColumn>Estado</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent={"Sin datos"}>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-gray-500"
                      >
                        Sin datos
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </main>
        </div>
      </div>
    </HeroUIProvider>
  );
};

export default Dashboard;
