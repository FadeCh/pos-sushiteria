import { useState, useEffect } from "react";
import axios from "axios";
import menu from "../menu.json";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function POS() {
  const [horaRetiro, setHoraRetiro] = useState("");
  const [medioPago, setMedioPago] = useState("Efectivo");
  const [observacion, setObservacion] = useState("");
  const [pagado, setPagado] = useState(false);
  const [pedido, setPedido] = useState([]);
  const [cliente, setCliente] = useState("");
  const [filtro, setFiltro] = useState("Todo");
  const [numeroComanda, setNumeroComanda] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("numeroComanda");
    setNumeroComanda(stored ? parseInt(stored) : 1);
  }, []);

  const incrementarComanda = () => {
    const next = numeroComanda + 1;
    setNumeroComanda(next);
    localStorage.setItem("numeroComanda", next);
  };

  const agregarItem = (item) => {
    const existe = pedido.find((i) => i.nombre === item.nombre);
    if (existe) {
      setPedido(
        pedido.map((i) =>
          i.nombre === item.nombre ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      );
    } else {
      setPedido([...pedido, { ...item, cantidad: 1 }]);
    }
  };

  const eliminarItem = (nombre) => {
    const actualizado = pedido
      .map((i) =>
        i.nombre === nombre ? { ...i, cantidad: i.cantidad - 1 } : i
      )
      .filter((i) => i.cantidad > 0);

    setPedido(actualizado);
  };

  const total = pedido.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const imprimirComanda = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(18);
    //doc.text("La sushitería", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(12);
    const fechaHora = new Date();
    const fechaFormateada = fechaHora.toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short",
    });

    doc.text(`N° Comanda: ${numeroComanda.toString().padStart(3, '0')}`, pageWidth - 60, 30);
    doc.text(`${fechaFormateada}`, pageWidth - 60, 36);

    let y = 50;
    doc.setFontSize(14);
    doc.text(`Cliente: ${cliente || "Sin nombre"}`, 14, y);
    y += 10;
    doc.text(`Hora de Retiro: ${horaRetiro || "No definida"}`, 14, y);
    y += 10;

    // Cuadro de observación
    doc.setDrawColor(0);
    doc.rect(14, y, pageWidth - 28, 20);
    doc.text(`Observaciones: ${observacion}`, 18, y + 10);
    y += 30;

    const tabla = pedido.map((item) => [
      item.nombre,
      item.cantidad,
      `$${item.precio.toLocaleString("es-CL")}`,
      `$${(item.precio * item.cantidad).toLocaleString("es-CL")}`,
    ]);

    autoTable(doc, {
      head: [["Producto", "Cantidad", "Precio", "Subtotal"]],
      body: tabla,
      startY: y,
      styles: { halign: 'center' },
      headStyles: { fillColor: [41, 128, 185] },
    });

    const afterTable = doc.lastAutoTable.finalY + 10;
    doc.text(`Medio de Pago: ${medioPago}`, 14, afterTable);
    doc.text(`Pagado: ${pagado ? "Sí" : "No"}`, 14, afterTable + 10);

    doc.setFontSize(16);
    doc.text(`Total: $${total.toLocaleString("es-CL")}`, 14, afterTable + 25);

    const clienteNombre = cliente.trim().replace(/\s+/g, "_") || "sin_nombre";
    const fechaArchivo = new Date()
      .toISOString()
      .slice(0, 16)
      .replace("T", "_")
      .replace(":", "-");

    const nombreArchivo = `Comanda_${numeroComanda}_${clienteNombre}_${fechaArchivo}.pdf`;
    doc.save(nombreArchivo);
  };

  const confirmarEnvio = async () => {
    try {
      await axios.post("http://localhost:3001/api/pedidos", {
        cliente,
        horaRetiro,
        items: pedido,
        total,
        medioPago,
        observacion,
        pagado,
        numeroComanda,
      });

      imprimirComanda();
      alert("Pedido enviado con éxito ✅");
      setPedido([]);
      setCliente("");
      setHoraRetiro("");
      setMedioPago("Efectivo");
      setObservacion("");
      setPagado(false);
      incrementarComanda();
      setMostrarModal(false);
    } catch (error) {
      alert("Error al enviar pedido ❌");
    }
  };

  const enviarPedido = () => {
    if (!cliente) return alert("Debes ingresar el nombre del cliente.");
    if (pedido.length === 0) return alert("El pedido está vacío.");
    setMostrarModal(true);
  };

  // ... aquí continúa el JSX de la aplicación como ya lo tenías


  const categorias = ["Todo", ...new Set(menu.map((item) => item.categoria))];
  const menuFiltrado =
    filtro === "Todo"
      ? menu
      : menu.filter((item) => item.categoria === filtro);

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <h1>🧾 La Sushitería</h1>

      <div style={{ marginBottom: "15px" }}>
        <label>Nombre Cliente: </label>
        <input
          type="text"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Ej: Juan Pérez"
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Hora de Retiro: </label>
        <input
          type="time"
          value={horaRetiro}
          onChange={(e) => setHoraRetiro(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Medio de Pago: </label>
        <select
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value)}
        >
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Tarjeta">Tarjeta</option>
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          <input
            type="checkbox"
            checked={pagado}
            onChange={(e) => setPagado(e.target.checked)}
          />{" "}
          Pagado
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Observación:</label>
        <textarea
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          placeholder="Ej: sin palta / entregar en portón"
          rows="3"
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>Filtrar por categoría:</strong>{" "}
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          {categorias.map((c, i) => (
            <option key={i}>{c}</option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "10px",
        }}
      >
        {menuFiltrado.map((item, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px",
            }}
          >
            <strong>{item.nombre}</strong>
            <p style={{ margin: "5px 0" }}>${item.precio.toLocaleString("es-CL")}</p>
            <button onClick={() => agregarItem(item)}>Agregar</button>
          </div>
        ))}
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h2>Resumen del Pedido</h2>
      {pedido.length === 0 ? (
        <p>No hay productos aún</p>
      ) : (
        <>
          <ul>
            {pedido.map((item, i) => (
              <li key={i}>
                {item.nombre} × {item.cantidad} = ${
                  (item.precio * item.cantidad).toLocaleString("es-CL")
                }{" "}
                <button onClick={() => eliminarItem(item.nombre)}>❌</button>
              </li>
            ))}
          </ul>
          <p><strong>Total:</strong> ${total.toLocaleString("es-CL")}</p>
          <p><strong>Hora de Retiro:</strong> {horaRetiro || "No definida"}</p>
          <p><strong>Medio de Pago:</strong> {medioPago}</p>
          <p><strong>Pagado:</strong> {pagado ? "Sí" : "No"}</p>
          {observacion && (
            <p><strong>Observación:</strong> {observacion}</p>
          )}
          <button onClick={enviarPedido}>🧾 Enviar Pedido</button>
        </>
      )}

      {mostrarModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "10px",
            width: "90%",
            maxWidth: "500px"
          }}>
            <h2>¿Confirmar Pedido?</h2>
            <p><strong>Cliente:</strong> {cliente}</p>
            <p><strong>Total:</strong> ${total.toLocaleString("es-CL")}</p>
            <p><strong>Hora de Retiro:</strong> {horaRetiro}</p>
            <p><strong>Medio de Pago:</strong> {medioPago}</p>
            <p><strong>Pagado:</strong> {pagado ? "Sí" : "No"}</p>
            {observacion && <p><strong>Observación:</strong> {observacion}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
              <button onClick={() => setMostrarModal(false)}>Cancelar</button>
              <button onClick={confirmarEnvio}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}