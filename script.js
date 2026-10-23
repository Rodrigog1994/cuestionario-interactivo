const preguntasQuiz = [
  {
    pregunta: "¿Cuál es la capital de Francia?",
    respuestas: [
      { texto: "Londres", correcta: false },
      { texto: "Berlín", correcta: false },
      { texto: "París", correcta: true },
      { texto: "Madrid", correcta: false },
    ],
  },
  {
    pregunta: "¿Qué planeta es conocido como el Planeta Rojo?",
    respuestas: [
      { texto: "Venus", correcta: false },
      { texto: "Marte", correcta: true },
      { texto: "Júpiter", correcta: false },
      { texto: "Saturno", correcta: false },
    ],
  },
  {
    pregunta: "¿Cuál es el océano más grande de la Tierra?",
    respuestas: [
      { texto: "Océano Atlántico", correcta: false },
      { texto: "Océano Índico", correcta: false },
      { texto: "Océano Ártico", correcta: false },
      { texto: "Océano Pacífico", correcta: true },
    ],
  },
  {
    pregunta: "¿Cuál de estos NO es un lenguaje de programación?",
    respuestas: [
      { texto: "Java", correcta: false },
      { texto: "Python", correcta: false },
      { texto: "Banana", correcta: true },
      { texto: "JavaScript", correcta: false },
    ],
  },
  {
    pregunta: "¿Cuál es el símbolo químico del oro?",
    respuestas: [
      { texto: "Go", correcta: false },
      { texto: "Gd", correcta: false },
      { texto: "Au", correcta: true },
      { texto: "Ag", correcta: false },
    ],
  },
];

const app = document.getElementById("app");
let nombreJugador = "";
let totalPreguntas = preguntasQuiz.length;
let indicePreguntaActual = 0;
let puntaje = 0;
let respuestasHabilitadas = true;

let textoPregunta;
let contenedorRespuestas;
let spanPreguntaActual;
let spanPuntaje;
let barraProgreso;
const listaJugadores = obtenerLocalStorage();

function crearElemento(etiqueta, clases, texto) {
  const elemento = document.createElement(etiqueta);
  if (clases) {
    elemento.classList.add(...clases.split(" "));
  }
  if (texto !== undefined) {
    elemento.textContent = texto;
  }
  return elemento;
}

function contenedorNuevo() {
  app.innerHTML = "";
  const contenedor = crearElemento("div", "contenedor-nuevo");
  app.appendChild(contenedor);
  return contenedor;
}

function crearCampo(id, textoEtiqueta, placeholder, modoInput) {
  const grupo = crearElemento("div", "grupo-formulario");

  const etiqueta = crearElemento("label", "etiqueta", textoEtiqueta);
  etiqueta.setAttribute("for", id);

  const input = crearElemento("input", "campo");
  input.setAttribute("id", id);
  input.setAttribute("type", "text");
  input.setAttribute("placeholder", placeholder);
  if (modoInput) {
    input.setAttribute("inputmode", modoInput);
  }

  const error = crearElemento("p", "mensaje-error");

  grupo.appendChild(etiqueta);
  grupo.appendChild(input);
  grupo.appendChild(error);

  return { grupo, input, error };
}

function mostrarError(campo, mensaje) {
  campo.error.textContent = mensaje;
  campo.input.classList.add("campo-error");
}

function limpiarError(campo) {
  campo.error.textContent = "";
  campo.input.classList.remove("campo-error");
}

// ---------- VALIDACIONES ----------

function validarNombre(valor) {
  const nombre = valor.trim();

  if (nombre === "") {
    return "Ingresá tu nombre.";
  }
  if (nombre.length < 2 || nombre.length > 20) {
    return "Tu nombre tiene que tener entre 2 y 20 caracteres.";
  }
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/.test(nombre)) {
    return "Tu nombre solo puede tener letras y espacios.";
  }
  return "";
}

function validarCantidad(valor) {
  const texto = valor.trim();

  if (texto === "") {
    return "Ingresá cuántas preguntas querés responder.";
  }
  if (isNaN(texto)) {
    return "Ingresá un número, no texto.";
  }

  const numero = Number(texto);

  if (!Number.isInteger(numero)) {
    return "La cantidad de preguntas tiene que ser un número entero.";
  }
  if (numero < 1 || numero > preguntasQuiz.length) {
    return "Elegí un número entre 1 y " + preguntasQuiz.length + ".";
  }
  return "";
}


function mostrarPantallaInicio() {
  const contenedor = contenedorNuevo();

  const titulo = crearElemento("h1", "titulo", "¡Hora del Quiz!");
  const subtitulo = crearElemento(
    "p",
    "subtitulo",
    "Poné a prueba tus conocimientos con estas preguntas"
  );

  const formulario = crearElemento("form", "formulario");
  formulario.setAttribute("novalidate", "");

  const campoNombre = crearCampo("input-nombre", "Tu nombre", "Ej: Rodrigo");
  const campoCantidad = crearCampo(
    "input-cantidad",
    "Cantidad de preguntas (1 a " + preguntasQuiz.length + ")",
    "Ej: 5",
    "numeric"
  );

  const botonEmpezar = crearElemento("button", "boton", "Empezar Quiz");
  botonEmpezar.setAttribute("type", "submit");

  formulario.appendChild(campoNombre.grupo);
  formulario.appendChild(campoCantidad.grupo);
  formulario.appendChild(botonEmpezar);

  campoNombre.input.addEventListener("input", () => limpiarError(campoNombre));
  campoCantidad.input.addEventListener("input", () =>
    limpiarError(campoCantidad)
  );

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const errorNombre = validarNombre(campoNombre.input.value);
    const errorCantidad = validarCantidad(campoCantidad.input.value);

    if (errorNombre) mostrarError(campoNombre, errorNombre);
    if (errorCantidad) mostrarError(campoCantidad, errorCantidad);

    
    if (errorNombre || errorCantidad) return;

    nombreJugador = campoNombre.input.value.trim();
    totalPreguntas = Number(campoCantidad.input.value.trim());
    iniciarQuiz();
  });

  contenedor.appendChild(titulo);
  contenedor.appendChild(subtitulo);
  contenedor.appendChild(formulario);

  campoNombre.input.focus();
}

function mostrarPantallaQuiz() {
  const contenedor = contenedorNuevo();

  const encabezado = crearElemento("div", "encabezado-quiz");
  textoPregunta = crearElemento("h2", "texto-pregunta", "");

  const info = crearElemento("div", "info-quiz");

  const infoPregunta = crearElemento("p");
  spanPreguntaActual = crearElemento("span", "", "1");
  infoPregunta.appendChild(document.createTextNode("Pregunta "));
  infoPregunta.appendChild(spanPreguntaActual);
  infoPregunta.appendChild(document.createTextNode(" de " + totalPreguntas));

  const infoPuntaje = crearElemento("p");
  spanPuntaje = crearElemento("span", "", "0");
  infoPuntaje.appendChild(document.createTextNode("Puntaje: "));
  infoPuntaje.appendChild(spanPuntaje);

  info.appendChild(infoPregunta);
  info.appendChild(infoPuntaje);
  encabezado.appendChild(textoPregunta);
  encabezado.appendChild(info);

  contenedorRespuestas = crearElemento("div", "contenedor-respuestas");

  const contenedorProgreso = crearElemento("div", "barra-progreso");
  barraProgreso = crearElemento("div", "progreso");
  contenedorProgreso.appendChild(barraProgreso);

  contenedor.appendChild(encabezado);
  contenedor.appendChild(contenedorRespuestas);
  contenedor.appendChild(contenedorProgreso);
}

function mostrarPantallaResultado() {
  const contenedor = contenedorNuevo();

  const titulo = crearElemento("h1", "titulo", "Resultados del Quiz");

  const infoResultado = crearElemento("div", "info-resultado");

  const textoPuntaje = crearElemento(
    "p",
    "",
    nombreJugador +
      ", obtuviste " +
      puntaje +
      " de " +
      totalPreguntas +
      " puntos"
  );
  const mensaje = crearElemento(
    "div",
    "mensaje-resultado",
    obtenerMensajeResultado()
  );

  infoResultado.appendChild(textoPuntaje);
  infoResultado.appendChild(mensaje);

  const botonReiniciar = crearElemento("button", "boton", "Reiniciar Quiz");
  botonReiniciar.addEventListener("click", reiniciarQuiz);

  const botonTabla = crearElemento("button","boton","Tabla de Puntuaciones");
  botonTabla.addEventListener("click", mostrarTabla);

  contenedor.appendChild(titulo);
  contenedor.appendChild(infoResultado);
  contenedor.appendChild(botonReiniciar);
  contenedor.appendChild(botonTabla);
}

// ---------- LÓGICA DEL JUEGO ----------

function iniciarQuiz() {
  indicePreguntaActual = 0;
  puntaje = 0;

  mostrarPantallaQuiz();
  mostrarPregunta();
}

function mostrarPregunta() {
  respuestasHabilitadas = true;

  const preguntaActual = preguntasQuiz[indicePreguntaActual];

  spanPreguntaActual.textContent = indicePreguntaActual + 1;

  const porcentajeProgreso = (indicePreguntaActual / totalPreguntas) * 100;
  barraProgreso.style.width = porcentajeProgreso + "%";

  textoPregunta.textContent = preguntaActual.pregunta;

  contenedorRespuestas.innerHTML = "";

  preguntaActual.respuestas.forEach((respuesta) => {
    const boton = crearElemento("button", "boton-respuesta", respuesta.texto);
    boton.dataset.correcta = respuesta.correcta;
    boton.addEventListener("click", seleccionarRespuesta);
    contenedorRespuestas.appendChild(boton);
  });
}

function seleccionarRespuesta(evento) {
  if (!respuestasHabilitadas) return;

  respuestasHabilitadas = false;

  const botonSeleccionado = evento.target;
  const esCorrecta = botonSeleccionado.dataset.correcta === "true";

  Array.from(contenedorRespuestas.children).forEach((boton) => {
    if (boton.dataset.correcta === "true") {
      boton.classList.add("correcta");
    } else if (boton === botonSeleccionado) {
      boton.classList.add("incorrecta");
    }
  });

  if (esCorrecta) {
    puntaje++;
    spanPuntaje.textContent = puntaje;
  }

  setTimeout(() => {
    indicePreguntaActual++;

    if (indicePreguntaActual < totalPreguntas) {
      mostrarPregunta();
    } else {
      actualizarLista();
      mostrarPantallaResultado();
    }
  }, 1000);
}


function obtenerMensajeResultado() {
  const porcentaje = (puntaje / totalPreguntas) * 100;

  const avancePorcentaje = porcentaje == 100 ? "Excelente"
                         : porcentaje >= 80  ? "Muy bien"
                         : porcentaje >= 60  ? "Bienn vamos!!"
                         : porcentaje >= 40  ? "Buen esfuerzo no aflojes"
                         : porcentaje >= 20  ? "A seguir estudiando!!"
                         : "A meterle"; 
                        return  avancePorcentaje; 
                      }

function mostrarTabla( ) {
const contenedor = contenedorNuevo();
const tabla = crearElemento("table","tabla-puntajes");
const thead = crearElemento("thead","encabezado-tabla");
const tr    = crearElemento("tr","fila");
const thNombre    = crearElemento("th","titulo-nombre","Nombre");
const thPuntaje    = crearElemento("th","titulo-puntaje","Puntaje");
const tbody = crearElemento("tbody","cuerpo-tabla");


listaJugadores.forEach((jugador) => {
      const trbody = crearElemento("tr","fila-body");
      const celdaNombre = crearElemento("td","nombre-jugador",jugador.nombreJugador);
      const celdaPuntaje = crearElemento("td","puntaje-jugador",jugador.puntaje);
      tbody.appendChild(trbody);
      trbody.appendChild(celdaNombre);
      trbody.appendChild(celdaPuntaje);
});

const botonReiniciar = crearElemento("button", "boton", "Reiniciar Quiz");
   botonReiniciar.addEventListener("click", reiniciarQuiz);

tabla.appendChild(thead);
tabla.appendChild(tbody);
thead.appendChild(tr);
tr.appendChild(thNombre);
tr.appendChild(thPuntaje);
contenedor.appendChild(tabla);
contenedor.appendChild(botonReiniciar);
}

function actualizarLista(){
    listaJugadores.push({ nombreJugador: nombreJugador, puntaje: puntaje })
    almacenarLocalStorage()
}

function almacenarLocalStorage (){
  const convertirObjeto = JSON.stringify(listaJugadores);
  localStorage.setItem("jugadores",convertirObjeto);
}

function obtenerLocalStorage(){
  const obtenerTexto = localStorage.getItem("jugadores");
   return JSON.parse (obtenerTexto) || [];

}

function reiniciarQuiz() {
  mostrarPantallaInicio();
}

// ---------- INICIO ----------
mostrarPantallaInicio();

