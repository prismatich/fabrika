import { Calendar, Card, CardBody, CardHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import React from "react";
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const Dashboard: React.FC = () => {
  // Datos de ejemplo (vacíos, luego los reemplazas con tu backend/API)
  const lineData = [
    { name: "Enero", activos: 0, pasivos: 0 },
    { name: "Febrero", activos: 0, pasivos: 0 },
  ];

  const pieData = [
    { name: "Categoría A", value: 0 },
    { name: "Categoría B", value: 0 },
  ];

  const barData = [
    { name: "Producto 1", value: 0 },
    { name: "Producto 2", value: 0 },
  ];

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      {/* Métricas principales */}
      <Card className="col-span-3">
        <CardHeader>Ingresos</CardHeader>
        <CardBody>
          <p className="text-2xl font-bold">$0</p>
        </CardBody>
      </Card>

      <Card className="col-span-3">
        <CardHeader>Gastos</CardHeader>
        <CardBody>
          <p className="text-2xl font-bold">$0</p>
        </CardBody>
      </Card>

      <Card className="col-span-3">
        <CardHeader>Ganancia Neta</CardHeader>
        <CardBody>
          <p className="text-2xl font-bold">$0</p>
        </CardBody>
      </Card>

      <Card className="col-span-3">
        <CardHeader>Clientes</CardHeader>
        <CardBody>
          <p className="text-2xl font-bold">0</p>
        </CardBody>
      </Card>

      {/* Gráfico de líneas */}
      <Card className="col-span-6 h-[300px]">
        <CardHeader>Activos vs Pasivos</CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <Line type="monotone" dataKey="activos" stroke="#0088FE" />
              <Line type="monotone" dataKey="pasivos" stroke="#FF8042" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Gráfico de torta */}
      <Card className="col-span-3 h-[300px]">
        <CardHeader>Análisis</CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={80} label>
                {pieData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][index % 4]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Calendario */}
      <Card className="col-span-3 h-[300px]">
        <CardHeader>Calendario</CardHeader>
        <CardBody>
          <Calendar aria-label="Calendario" />
        </CardBody>
      </Card>

      {/* Gráfico de barras */}
      <Card className="col-span-6 h-[300px]">
        <CardHeader>Producción</CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Tabla */}
      <Card className="col-span-12">
        <CardHeader>Últimos Movimientos</CardHeader>
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
                <TableCell colSpan={4} className="text-center">
            Sin datos
                </TableCell>
            </TableRow>
</TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
