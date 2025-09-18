import {
  Avatar,
  Button,
  Calendar,
  Card,
  CardBody,
  CardHeader,
  HeroUIProvider,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import {
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  KeyRound,
  LogOut,
  Mail,
  Menu,
  Package,
  Search,
  ShoppingCart,
  User,
  Users2,
} from "lucide-react";
import React, { useState } from "react";

const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>("Inicio");

  const clientes = [
    { nombre: "Carlos Flores", estado: "En línea" },
    { nombre: "Junior Garcia", estado: "Conectado hace 2 min" },
    { nombre: "Sebastian Mora", estado: "Conectado hace 5 min" },
    { nombre: "Julio Molina", estado: "Conectado hace 1 hora" },
  ];
  const proveedores = [
    { nombre: "Yohan Quintero", estado: "Conectado hace 3 h" },
    { nombre: "Sol Miranda", estado: "Conectado hace 2 días" },
  ];
  const sucursales = [
    { nombre: "Sucursal Norte", estado: "Activo" },
    { nombre: "Sucursal Centro", estado: "Activo" },
  ];

  const menuItems = [
    { icon: Menu, label: "Inicio" },
    { icon: BarChart3, label: "Estadísticas" },
    {
      icon: Package,
      label: "Inventario",
      sub: ["Recetas", "Materiales"],
    },
    { icon: ClipboardList, label: "Proveedores" },
    { icon: ShoppingCart, label: "Sucursales" },
    { icon: Users2, label: "Clientes" },
    { icon: User, label: "Usuarios" },
    { icon: KeyRound, label: "Registros" },
    {
      icon: Building2,
      label: "Administración",
      sub: ["Empresas", "Usuarios (Admin)", "Registros (Admin)"],
    },
  ];

  return (
    <HeroUIProvider>
      <div className="flex h-screen bg-[#F6F4F4]">
        {/* Sidebar */}
        <aside className="w-64 bg-F6F4F4 shadow-md p-4 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black mb-4">PRISMATIC</h1>
            <nav className="flex flex-col gap-1">
              {menuItems.map(({ icon: Icon, label, sub }) => (
                <div key={label}>
                  <Button
                    variant="light"
                    className={`flex items-center gap-3 justify-start w-full hover:bg-gray-100
                      ${activeMenu === label ? "bg-gray-200 text-blue-600 font-semibold" : ""}`}
                    onClick={() => setActiveMenu(label)}
                  >
                    <Icon size={20} />
                    {label}
                  </Button>

                  {sub &&
                    activeMenu === label &&
                    sub.map((s) => (
                      <div key={s} className="ml-8 my-1">
                        <Button
                          variant="light"
                          size="sm"
                          className="w-full justify-start text-sm text-gray-600 hover:bg-gray-100"
                        >
                          • {s}
                        </Button>
                      </div>
                    ))}
                </div>
              ))}
            </nav>
          </div>

          <Button
            variant="light"
            color="danger"
            className="flex items-center gap-3 justify-start hover:bg-red-50 text-red-500"
          >
            <LogOut size={20} /> Cerrar sesión
          </Button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between bg-white shadow px-6 py-3">
            <div className="flex items-center gap-3">
              <Avatar name="SCI" />
              <h2 className="text-lg font-semibold">Bienvenido a SCI</h2>
            </div>
            <div className="flex items-center gap-4">
              <Tooltip content="Buscar">
                <Search className="cursor-pointer" />
              </Tooltip>
              <Tooltip content="Mensajes">
                <Mail className="cursor-pointer" />
              </Tooltip>
              <Tooltip content="Notificaciones">
                <Bell className="cursor-pointer" />
              </Tooltip>
              <span className="font-semibold">Admin</span>
              <Avatar name="Admin" />
            </div>
          </header>
                        <main className="flex-1 overflow-y-auto p-4 flex gap-4">
            <div className="flex-1 flex flex-col gap-4">
              {/* Tarjetas rápidas + Calendario */}
              <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Tarjetas en 2 filas de 3 */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Inventario */}
                  <Card className="bg-gray-200">
                    <CardHeader className="font-bold">Inventario</CardHeader>
                    <CardBody className="flex flex-col gap-2">
                      <Button size="sm" variant="light">Agregar material</Button>
                      <Button size="sm" variant="light">Crear receta</Button>
                    </CardBody>
                  </Card>
                  {/* Proveedores */}
                  <Card className="bg-gray-200">
                    <CardHeader className="font-bold">Proveedores</CardHeader>
                    <CardBody className="flex flex-col gap-2">
                      <Button size="sm" variant="light">Registrar proveedor</Button>
                      <Button size="sm" variant="light">Contactar proveedor</Button>
                    </CardBody>
                  </Card>
                  {/* Usuarios */}
                  <Card className="bg-gray-200">
                    <CardHeader className="font-bold">Usuarios</CardHeader>
                    <CardBody className="flex flex-col gap-2">
                      <Button size="sm" variant="light">Invitar usuario</Button>
                      <Button size="sm" variant="light">Asignar rol rápido</Button>
                    </CardBody>
                  </Card>
                  {/* Sucursales */}
                  <Card className="bg-gray-200">
                    <CardHeader className="font-bold">Sucursales</CardHeader>
                    <CardBody className="flex flex-col gap-2">
                      <Button size="sm" variant="light">Agregar sucursal</Button>
                      <Button size="sm" variant="light">Buscar sucursal</Button>
                    </CardBody>
                  </Card>
                  {/* Clientes */}
                  <Card className="bg-gray-200">
                    <CardHeader className="font-bold">Clientes</CardHeader>
                    <CardBody className="flex flex-col gap-2">
                      <Button size="sm" variant="light">Registrar cliente</Button>
                      <Button size="sm" variant="light">Contactar cliente</Button>
                    </CardBody>
                  </Card>
                  {/* Estadísticas (resumen) */}
                  <Card className="bg-gray-200">
                    <CardHeader className="font-bold">Estadísticas</CardHeader>
                    <CardBody className="flex justify-center items-center text-gray-500">
                      📊 Resumen general
                    </CardBody>
                  </Card>
                </div>
                {/* Calendario */}
                <Card className="h-full">
                  <CardBody className="flex justify-center">
                    <Calendar aria-label="Calendario" />
                  </CardBody>
                </Card>
              </section>
              {/* Sección de estadísticas grande */}
              <section className="mt-6">
                <Card>
                  <CardHeader className="flex justify-between">
                    <span className="font-bold">Estadísticas</span>
                    <Button size="sm" variant="light">Exportar reporte</Button>
                  </CardHeader>
                  <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Activos y Pasivos */}
                    <div className="flex flex-col gap-4">
                      <Card className="h-40">
                        <CardHeader className="font-bold">Activos</CardHeader>
                        <CardBody className="flex justify-center items-center text-gray-500">
                          📈 Activos gráfico
                        </CardBody>
                      </Card>
                      <Card className="h-40">
                        <CardHeader className="font-bold">Pasivos</CardHeader>
                        <CardBody className="flex justify-center items-center text-gray-500">
                          📉 Pasivos gráfico
                        </CardBody>
                      </Card>
                    </div>

                    {/* Análisis y Producción */}
                    <div className="flex flex-col gap-4">
                      <Card className="h-40">
                        <CardHeader className="font-bold">Análisis</CardHeader>
                        <CardBody className="flex justify-center items-center text-gray-500">
                          🧠 KPI o gráfico circular
                        </CardBody>
                      </Card>
                      <Card className="h-40">
                        <CardHeader className="font-bold">Producción</CardHeader>
                        <CardBody className="flex justify-center items-center text-gray-500">
                          📊 Producción gráfico
                        </CardBody>
                      </Card>
                    </div>
                  </CardBody>
                </Card>
              </section>

              {/* Últimos Movimientos */}
              <Card className="mt-6">
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
                        <TableCell colSpan={4} className="text-center text-gray-500">
                          Sin datos
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </div>

            {/* Sidebar derecho */}
            <div className="w-64 flex flex-col gap-4">
              <Card className="flex-1">
                <CardHeader className="font-bold">Clientes</CardHeader>
                <CardBody className="flex flex-col gap-2">
                  {clientes.map((c) => (
                    <div key={c.nombre} className="flex items-center gap-2">
                      <Avatar name={c.nombre} size="sm" />
                      <div>
                        <p className="font-medium text-sm">{c.nombre}</p>
                        <p className="text-xs text-gray-500">{c.estado}</p>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="font-bold">Proveedores</CardHeader>
                <CardBody className="flex flex-col gap-2">
                  {proveedores.map((p) => (
                    <div key={p.nombre} className="flex items-center gap-2">
                      <Avatar name={p.nombre} size="sm" />
                      <div>
                        <p className="font-medium text-sm">{p.nombre}</p>
                        <p className="text-xs text-gray-500">{p.estado}</p>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="font-bold">Sucursales</CardHeader>
                <CardBody className="flex flex-col gap-2">
                  {sucursales.map((s) => (
                    <div key={s.nombre} className="flex items-center gap-2">
                      <Avatar name={s.nombre} size="sm" />
                      <div>
                        <p className="font-medium text-sm">{s.nombre}</p>
                        <p className="text-xs text-gray-500">{s.estado}</p>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </HeroUIProvider>
  );
};

export default Dashboard;
