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
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

// Tipos para los datos
interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  birthDate?: string;
  gender?: string;
  active: boolean;
  createdAt: string;
}

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  active: boolean;
  createdAt: string;
}

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  active: boolean;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user, logout, checkAuth, isLoading } = useAuthStore();
  const [activeMenu, setActiveMenu] = useState<string>("Inicio");
  
  // Estados para los datos
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Funciones para obtener datos de las APIs
  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers', {
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCustomers(data.customers || []);
        } else {
          setDataError(data.message || 'Error al cargar clientes');
        }
      } else {
        const errorData = await response.json();
        setDataError(`Error ${response.status}: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      setDataError('Error de conexión al obtener clientes');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers', {
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuppliers(data.suppliers || []);
        } else {
          setDataError(data.message || 'Error al cargar proveedores');
        }
      } else {
        const errorData = await response.json();
        setDataError(`Error ${response.status}: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      setDataError('Error de conexión al obtener proveedores');
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches', {
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBranches(data.branches || []);
        } else {
          setDataError(data.message || 'Error al cargar sucursales');
        }
      } else {
        const errorData = await response.json();
        setDataError(`Error ${response.status}: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al obtener sucursales:', error);
      setDataError('Error de conexión al obtener sucursales');
    }
  };

  const fetchAllData = async () => {
    setDataLoading(true);
    setDataError(null);
    
    try {
      await Promise.all([
        fetchCustomers(),
        fetchSuppliers(),
        fetchBranches()
      ]);
    } catch (error) {
      setDataError('Error al cargar los datos');
      console.error('Error al cargar datos:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      
      // Después de checkAuth, verificar si hay usuario
      const currentUser = useAuthStore.getState().user;
      
      if (!currentUser) {
        window.location.href = '/';
      } else {
        // Cargar datos después de autenticación exitosa
        fetchAllData();
      }
    };
    verifyAuth();
  }, [checkAuth]);

  // Cargar datos cuando el usuario esté disponible
  useEffect(() => {
    if (user && !dataLoading) {
      // Esperar un poco para que las cookies se establezcan correctamente
      setTimeout(() => {
        fetchAllData();
      }, 1000);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  // Función para manejar el cambio de menú
  const handleMenuChange = (menu: string) => {
    setActiveMenu(menu);
    
    // Cargar datos específicos según el menú seleccionado
    switch (menu) {
      case "Clientes":
        fetchCustomers();
        break;
      case "Proveedores":
        fetchSuppliers();
        break;
      case "Sucursales":
        fetchBranches();
        break;
      default:
        break;
    }
  };

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

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar loading (se redirigirá después de checkAuth)
  if (!user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

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
                    onClick={() => handleMenuChange(label)}
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
          <header className="flex items-center justify-between bg-white shadow px-6 py-4">
            <h2 className="text-lg font-semibold">Bienvenido, {user.name}</h2>
            <div className="flex items-center gap-4">
              <Input placeholder="Buscar..." size="sm" className="w-48" />
              <div className="flex items-center gap-2">
                <Tooltip content="Mensajes">
                  <Mail className="cursor-pointer" />
                </Tooltip>
                <Tooltip content="Notificaciones">
                  <Bell className="cursor-pointer" />
                </Tooltip>
                <Avatar name={user.name} />
                <Button
                  variant="light"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </Button>
              </div>
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
              {dataError && (
                <Card className="bg-red-50 border-red-200">
                  <CardBody className="text-red-600 text-sm">
                    ⚠️ {dataError}
                  </CardBody>
                </Card>
              )}
              
              <Card className="flex-1">
                <CardHeader className="font-bold">Clientes ({customers.length})</CardHeader>
                <CardBody className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {dataLoading ? (
                    <div className="text-center text-gray-500">Cargando...</div>
                  ) : customers.length > 0 ? (
                    customers.slice(0, 5).map((customer) => (
                      <div key={customer.id} className="flex items-center gap-2">
                        <Avatar name={customer.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{customer.name}</p>
                          <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          customer.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">No hay clientes</div>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="font-bold">Proveedores ({suppliers.length})</CardHeader>
                <CardBody className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {dataLoading ? (
                    <div className="text-center text-gray-500">Cargando...</div>
                  ) : suppliers.length > 0 ? (
                    suppliers.slice(0, 5).map((supplier) => (
                      <div key={supplier.id} className="flex items-center gap-2">
                        <Avatar name={supplier.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{supplier.name}</p>
                          <p className="text-xs text-gray-500 truncate">{supplier.email}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          supplier.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {supplier.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">No hay proveedores</div>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="font-bold">Sucursales ({branches.length})</CardHeader>
                <CardBody className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {dataLoading ? (
                    <div className="text-center text-gray-500">Cargando...</div>
                  ) : branches.length > 0 ? (
                    branches.slice(0, 5).map((branch) => (
                      <div key={branch.id} className="flex items-center gap-2">
                        <Avatar name={branch.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{branch.name}</p>
                          <p className="text-xs text-gray-500 truncate">{branch.city}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          branch.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {branch.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">No hay sucursales</div>
                  )}
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
