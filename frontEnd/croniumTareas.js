cargarHeader();

var parametrosURL = new URLSearchParams(window.location.search);
var objectIDProyecto = parametrosURL.get("objectID");
var nombreProyecto = parametrosURL.get("nombreProyecto");
var objectIdSeleccionado;
var checkedSeleccionado;

var paginacionNoCompletados = null;
var paginacionCompletados = null;

var paginacionGuardadaAnteriorNoCompletados = null;
var paginacionGuardadaAnteriorCompletados = null;

cargarEventos();
cargarListadoTareasNoCompletadas();
cargarListadoTareasCompletadas();

function cargarListadoTareasNoCompletadas() {
  fetch(`${urlGlobal}searchTareas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      proyectoId: objectIDProyecto,
      completado: false,
      pagina: 1,
    }),
  })
    .then((response) => response.json())
    .then(function (data) {
      fetch(`${urlGlobal}countTareasNoCompletadas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proyectoId: objectIDProyecto,
        }),
      })
        .then((response) => response.json())
        .then(function (dataCount) {
          crearDivsListadoTareasNoCompletadas(data, dataCount);
        });
    })
    .catch((error) => {
      window.location.href = "croniumProyectos.html";
    });
}

function editarTareaFetch(nombre, descripcion) {
  fetch(`${urlGlobal}updateTarea`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: objectIdSeleccionado,
      titulo: nombre,
      descripcion: descripcion,
      completado: checkedSeleccionado,
    }),
  })
    .then((response) => response.json())
    .then(function (data) {
      paginacionCompletados = document.getElementById(
        "inputPaginaCompletadas"
      ).value;
      paginacionNoCompletados = document.getElementById(
        "inputPaginaNoCompletadas"
      ).value;

      fetch("croniumTareas.html")
        .then((response) => response.text())
        .then((data) => {
          document.getElementById("contenedorTareas").innerHTML = data;
          cargarListaTareasCompletadasPaginator(paginacionCompletados);
          cargarListaTareasNoCompletadasPaginator(paginacionNoCompletados);
          cargarEventos();
        });
    });
}

function cargarListadoTareasCompletadas() {
  fetch(`${urlGlobal}searchTareas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      proyectoId: objectIDProyecto,
      completado: true,
      pagina: 1,
    }),
  })
    .then((response) => response.json())
    .then(function (data) {
      crearDivsListadoTareasCompletadas(data);
    })
    .catch((error) => {
      window.location.href = "croniumProyectos.html";
    });
}

function cargarListaTareasCompletadasPaginator(pagina) {
  fetch(`${urlGlobal}searchTareas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      proyectoId: objectIDProyecto,
      completado: true,
      pagina: parseInt(pagina),
    }),
  })
    .then((response) => response.json())
    .then(function (data) {
      crearDivsListadoTareasCompletadas(data);
    });
}

function cargarListaTareasNoCompletadasPaginator(pagina) {
  fetch(`${urlGlobal}searchTareas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      proyectoId: objectIDProyecto,
      completado: false,
      pagina: parseInt(pagina),
    }),
  })
    .then((response) => response.json())
    .then(function (data) {
      fetch(`${urlGlobal}countTareasNoCompletadas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proyectoId: objectIDProyecto,
        }),
      })
        .then((response) => response.json())
        .then(function (dataCount) {
          crearDivsListadoTareasNoCompletadas(data, dataCount);
        });
    });
}

function crearTareaFecth(nombre, descripcion) {
  fetch(`${urlGlobal}insertTarea`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      titulo: nombre,
      descripcion: descripcion,
      proyectoId: objectIDProyecto,
      completado: false,
    }),
  })
    .then((response) => response.json())
    .then(function (data) {
      fetch("croniumTareas.html")
        .then((response) => response.text())
        .then((data) => {
          document.getElementById("contenedorTareas").innerHTML = data;
          cargarListadoTareasCompletadas();
          cargarListadoTareasNoCompletadas();
          cargarEventos();
        });
    });
}

function borrarTarea() {
  fetch(`${urlGlobal}deleteTarea`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: objectIdSeleccionado }),
  })
    .then((response) => response.json())
    .then(function (data) {
      paginacionCompletados = document.getElementById(
        "inputPaginaCompletadas"
      ).value;
      paginacionNoCompletados = document.getElementById(
        "inputPaginaNoCompletadas"
      ).value;
      fetch("croniumTareas.html")
        .then((response) => response.text())
        .then((data) => {
          document.getElementById("contenedorTareas").innerHTML = data;
          cargarListaTareasCompletadasPaginator(paginacionCompletados);
          cargarListaTareasNoCompletadasPaginator(paginacionNoCompletados);
          cargarEventos();
        });
    });
}

function crearDivsListadoTareasNoCompletadas(data, dataCount = null) {
  let divGridTareasNoCompletadas = document.getElementById(
    "contenedorGridTareasNoCompletadas"
  );

  if (
    data == null &&
    paginacionNoCompletados != null &&
    paginacionNoCompletados != "0"
  ) {
    document.getElementById("inputPaginaNoCompletadas").value =
      parseInt(paginacionNoCompletados) - 1;
    paginacionNoCompletados = null;
    cargarListaTareasNoCompletadasPaginator(
      document.getElementById("inputPaginaNoCompletadas").value
    );
    return;
  } else if (
    paginacionNoCompletados != null &&
    paginacionNoCompletados != "0"
  ) {
    document.getElementById("inputPaginaNoCompletadas").value =
      paginacionNoCompletados;
    paginacionNoCompletados = null;
  }

  if (data != null) {
    if (dataCount != null) {
      divGridTareasNoCompletadas.innerHTML = `<div style="grid-column-start: 1; grid-column-end: 3; text-align: center;"><h3>Tareas no completadas / <span class='tareasCount'>${dataCount.numeroDeTareasSinCompletar}</span></h3></div>`;
    } else {
      divGridTareasNoCompletadas.innerHTML = `<div style="grid-column-start: 1; grid-column-end: 3; text-align: center;"><h3>Tareas no completadas / 0</h3></div>`;
    }
    for (let key in data) {
      const tarea = data[key];
      let divTarea = document.createElement("div");
      divTarea.classList.add("divTareas");
      divTarea.setAttribute("objectId", tarea.id);

      let spanBorrarTarea = document.createElement("span");
      spanBorrarTarea.classList.add("material-symbols-outlined");
      spanBorrarTarea.style.fontSize = "32px";
      spanBorrarTarea.style.cursor = "pointer";
      spanBorrarTarea.textContent = "delete";
      spanBorrarTarea.style.padding = "7px";
      spanBorrarTarea.addEventListener("click", abrirModalBorrarTarea);

      let spanEditarTarea = document.createElement("span");
      spanEditarTarea.classList.add("material-symbols-outlined");
      spanEditarTarea.style.fontSize = "32px";
      spanEditarTarea.style.cursor = "pointer";
      spanEditarTarea.textContent = "edit";
      spanEditarTarea.style.padding = "7px";
      spanEditarTarea.addEventListener("click", abrirModalEditarTarea);

      let divElementosBotones = document.createElement("div");
      divElementosBotones.style.display = "flex";
      divElementosBotones.style.justifyContent = "space-between";
      divElementosBotones.appendChild(spanBorrarTarea);
      divElementosBotones.appendChild(spanEditarTarea);

      let pNombreTarea = document.createElement("p");
      pNombreTarea.style.fontWeight = "bold";
      pNombreTarea.style.fontSize = "20px";
      pNombreTarea.textContent = tarea.titulo;
      pNombreTarea.classList.add("controlTexto");

      let hrSeparacionSuperior = document.createElement("hr");
      let hrSeparacionInferior = document.createElement("hr");

      let divPosicionCheckBox = document.createElement("div");
      divPosicionCheckBox.style.display = "flex";
      divPosicionCheckBox.style.justifyContent = "center";
      divPosicionCheckBox.style.alignItems = "center";

      let pDescripcionTarea = document.createElement("p");
      pDescripcionTarea.textContent = tarea.descripcion;
      pDescripcionTarea.classList.add("controlTexto");
      pDescripcionTarea.classList.add("textoRecortadoNoCompletada");
      pDescripcionTarea.style.maxHeight = "50px";

      let labelCompletado = document.createElement("label");
      labelCompletado.textContent = "Tarea completada";
      labelCompletado.style.fontSize = "18px";

      let inputCompletado = document.createElement("input");
      inputCompletado.setAttribute("type", "checkbox");
      inputCompletado.checked = tarea.completado;
      inputCompletado.classList.add("checkBoxCompletado");
      inputCompletado.addEventListener("change", cambiarCompletoIncompleto);

      divTarea.appendChild(pNombreTarea);
      divTarea.appendChild(pDescripcionTarea);
      divTarea.appendChild(hrSeparacionSuperior);
      divPosicionCheckBox.appendChild(labelCompletado);
      divPosicionCheckBox.appendChild(inputCompletado);
      divTarea.appendChild(divPosicionCheckBox);
      divTarea.appendChild(hrSeparacionInferior);
      divTarea.appendChild(divElementosBotones);
      divGridTareasNoCompletadas.appendChild(divTarea);
    }

    const pDescripcionTarea = document.querySelectorAll(
      ".textoRecortadoNoCompletada"
    );

    pDescripcionTarea.forEach((textoDescripcionTareas) => {
      // Crea el botón Mostrar más
      const btnMostrarMas = document.createElement("button");
      btnMostrarMas.innerText = "Mostrar más";
      btnMostrarMas.classList.add("btnMostrarMas");
      btnMostrarMas.style.visibility = "hidden"; // Oculta por defecto

      // Añade el botón al DOM
      textoDescripcionTareas.parentNode.insertBefore(
        btnMostrarMas,
        textoDescripcionTareas.nextSibling
      );

      // Verifica si el texto está cortado
      if (
        textoDescripcionTareas.scrollHeight >
        textoDescripcionTareas.clientHeight
      ) {
        btnMostrarMas.style.visibility = "visible"; // Muestra el botón si el texto está cortado
      }

      // Agrega evento de clic al botón
      btnMostrarMas.addEventListener("click", modalMostrarMas);

      paginacionGuardadaAnteriorNoCompletados = null;
    });
  } else {
    let inputPagina = document.getElementById("inputPaginaNoCompletadas");
    if (paginacionGuardadaAnteriorNoCompletados == null) {
      if (inputPagina.value != "0") {
        inputPagina.value = parseInt(inputPagina.value) - 1;
      }
    } else {
      inputPagina.value = paginacionGuardadaAnteriorNoCompletados;
      paginacionGuardadaAnteriorNoCompletados = null;
    }
  }
}

function crearDivsListadoTareasCompletadas(data) {
  let divGridTareasCompletadas = document.getElementById(
    "contenedorGridTareasCompletadas"
  );

  if (
    data == null &&
    paginacionCompletados != null &&
    paginacionCompletados != "0"
  ) {
    document.getElementById("inputPaginaCompletadas").value =
      parseInt(paginacionCompletados) - 1;
    paginacionCompletados = null;
    cargarListaTareasCompletadasPaginator(
      document.getElementById("inputPaginaCompletadas").value
    );
    return;
  } else if (paginacionCompletados != null && paginacionCompletados != "0") {
    document.getElementById("inputPaginaCompletadas").value =
      paginacionCompletados;
    paginacionCompletados = null;
  }

  if (data != null) {
    divGridTareasCompletadas.innerHTML =
      '<div style="grid-column-start: 1; grid-column-end: 3; text-align: center;"><h3>Tareas completadas</h3></div>';
    for (let key in data) {
      const tarea = data[key];
      let divTarea = document.createElement("div");
      divTarea.classList.add("divTareas");
      divTarea.setAttribute("objectId", tarea.id);
      divTarea.classList.add("tareasCompletadas");

      let spanBorrarTarea = document.createElement("span");
      spanBorrarTarea.classList.add("material-symbols-outlined");
      spanBorrarTarea.style.fontSize = "32px";
      spanBorrarTarea.style.cursor = "pointer";
      spanBorrarTarea.textContent = "delete";
      spanBorrarTarea.style.padding = "7px";
      spanBorrarTarea.addEventListener("click", abrirModalBorrarTarea);

      let spanEditarTarea = document.createElement("span");
      spanEditarTarea.classList.add("material-symbols-outlined");
      spanEditarTarea.style.fontSize = "32px";
      spanEditarTarea.style.cursor = "pointer";
      spanEditarTarea.textContent = "edit";
      spanEditarTarea.style.padding = "7px";
      spanEditarTarea.addEventListener("click", abrirModalEditarTarea);

      let divElementosBotones = document.createElement("div");
      divElementosBotones.style.display = "flex";
      divElementosBotones.style.justifyContent = "space-between";
      divElementosBotones.appendChild(spanBorrarTarea);
      divElementosBotones.appendChild(spanEditarTarea);

      let pNombreTarea = document.createElement("p");
      pNombreTarea.style.fontWeight = "bold";
      pNombreTarea.style.fontSize = "20px";
      pNombreTarea.textContent = tarea.titulo;
      pNombreTarea.classList.add("controlTexto");

      let pDescripcionTarea = document.createElement("p");
      pDescripcionTarea.textContent = tarea.descripcion;
      pDescripcionTarea.classList.add("controlTexto");
      pDescripcionTarea.classList.add("textoRecortadoCompletada");

      let labelCompletado = document.createElement("label");
      labelCompletado.textContent = "Tarea completada";
      labelCompletado.style.fontSize = "18px";

      let inputCompletado = document.createElement("input");
      inputCompletado.setAttribute("type", "checkbox");
      inputCompletado.checked = tarea.completado;
      inputCompletado.classList.add("checkBoxCompletado");
      inputCompletado.addEventListener("change", cambiarCompletoIncompleto);

      let hrSeparacionSuperior = document.createElement("hr");
      let hrSeparacionInferior = document.createElement("hr");

      let divPosicionCheckBox = document.createElement("div");
      divPosicionCheckBox.style.display = "flex";
      divPosicionCheckBox.style.justifyContent = "center";
      divPosicionCheckBox.style.alignItems = "center";

      divTarea.appendChild(pNombreTarea);
      divTarea.appendChild(pDescripcionTarea);
      divTarea.appendChild(hrSeparacionSuperior);
      divPosicionCheckBox.appendChild(labelCompletado);
      divPosicionCheckBox.appendChild(inputCompletado);
      divTarea.appendChild(divPosicionCheckBox);
      divTarea.appendChild(hrSeparacionInferior);
      divTarea.appendChild(divElementosBotones);
      divGridTareasCompletadas.appendChild(divTarea);
    }

    const pDescripcionTarea = document.querySelectorAll(
      ".textoRecortadoCompletada"
    );

    pDescripcionTarea.forEach((textoDescripcionTareas) => {
      // Crea el botón Mostrar más
      const btnMostrarMas = document.createElement("button");
      btnMostrarMas.innerText = "Mostrar más";
      btnMostrarMas.classList.add("btnMostrarMas");
      btnMostrarMas.style.visibility = "hidden"; // Oculta por defecto

      // Añade el botón al DOM
      textoDescripcionTareas.parentNode.insertBefore(
        btnMostrarMas,
        textoDescripcionTareas.nextSibling
      );

      // Verifica si el texto está cortado
      if (
        textoDescripcionTareas.scrollHeight >
        textoDescripcionTareas.clientHeight
      ) {
        btnMostrarMas.style.visibility = "visible"; // Muestra el botón si el texto está cortado
      }

      // Agrega evento de clic al botón
      btnMostrarMas.addEventListener("click", modalMostrarMas);
    });

    paginacionGuardadaAnteriorCompletados = null;
  } else {
    let inputPagina = document.getElementById("inputPaginaCompletadas");
    if (paginacionGuardadaAnteriorCompletados == null) {
      if (inputPagina.value != "0") {
        inputPagina.value = parseInt(inputPagina.value) - 1;
      }
    } else {
      inputPagina.value = paginacionGuardadaAnteriorCompletados;
      paginacionGuardadaAnteriorCompletados = null;
    }
  }
}

function modalMostrarMas(event) {
  let modalMostrarMas = document.getElementById("modalMostrarMas");
  document.getElementById("tituloMostrarMás").innerHTML =
    event.currentTarget.parentElement.children[0].innerHTML;
  document.getElementById("contenidoMostrarMas").innerHTML =
    event.currentTarget.parentElement.children[1].innerHTML;

  modalMostrarMas.style.display = "block";
}

function cargarEventos() {
  document.getElementById("insertarNombreProyecto").innerHTML = nombreProyecto;

  document
    .getElementById("buttonFlexCreacionTareas")
    .addEventListener("click", abrirModalCrearTarea);
  document
    .getElementById("closeCrearTarea")
    .addEventListener("click", cerrarModalCrearTarea);
  document
    .getElementById("closeBorrarTarea")
    .addEventListener("click", cerrarModalBorrarTarea);
  document
    .getElementById("btnCancelarEditTask")
    .addEventListener("click", cerrarModalEditarTarea);
  document
    .getElementById("btnCancelarCreateTask")
    .addEventListener("click", cerrarModalCancelarCrearTarea);
  document
    .getElementById("closeEditarTarea")
    .addEventListener("click", cerrarModalEditarTarea);
  document.getElementById("btnEditTask").addEventListener("click", editarTarea);
  document
    .getElementById("closeMostrarMas")
    .addEventListener("click", cerrarModalMostrarMas);
  document
    .getElementById("btnCreateTask")
    .addEventListener("click", botonCrearTarea);
  document
    .getElementById("btnAceptarDeleteTask")
    .addEventListener("click", borrarTarea);
  document
    .getElementById("btnCancelarDeleteTask")
    .addEventListener("click", cancelarBorrarTarea);
  document
    .getElementById("btnAceptarMostrarMas")
    .addEventListener("click", cerrarModalMostrarMas);
  document
    .getElementById("botonVolverAtras")
    .addEventListener("click", volverAtras);
  document
    .getElementById("btnAnteriorNoCompletadas")
    .addEventListener("click", pasarAnteriorNoCompletadas);
  document
    .getElementById("btnSiguienteNoCompletadas")
    .addEventListener("click", pasarSiguienteNoCompletadas);
  document
    .getElementById("btnAnteriorCompletadas")
    .addEventListener("click", pasarAnteriorCompletadas);
  document
    .getElementById("btnSiguienteCompletadas")
    .addEventListener("click", pasarSiguienteCompletadas);
  document
    .getElementById("inputPaginaNoCompletadas")
    .addEventListener("keydown", obtenerPaginacionAnteriorNoCompletados);
  document
    .getElementById("inputPaginaCompletadas")
    .addEventListener("keydown", obtenerPaginacionAnteriorCompletados);
  document
    .getElementById("inputPaginaNoCompletadas")
    .addEventListener("blur", indexPaginationNoCompletadas);
  document
    .getElementById("inputPaginaCompletadas")
    .addEventListener("blur", indexPaginationCompletadas);
}

function obtenerPaginacionAnteriorNoCompletados(event) {
  if (paginacionGuardadaAnteriorNoCompletados == null) {
    paginacionGuardadaAnteriorNoCompletados =
      this.value != "" ? this.value : "1";
  }

  if (event.key === "Enter" || event.keyCode === 13) {
    event.target.blur();
  }
}

function obtenerPaginacionAnteriorCompletados(event) {
  if (paginacionGuardadaAnteriorCompletados == null) {
    paginacionGuardadaAnteriorCompletados = this.value != "" ? this.value : "1";
  }

  if (event.key === "Enter" || event.keyCode === 13) {
    event.target.blur();
  }
}

function pasarAnteriorNoCompletadas() {
  let inputPagina = document.getElementById("inputPaginaNoCompletadas");
  if (inputPagina.value <= 1) {
    inputPagina.value = 1;
  } else {
    inputPagina.value = parseInt(inputPagina.value) - 1;
  }
  cargarListaTareasNoCompletadasPaginator(inputPagina.value);
}

function pasarSiguienteNoCompletadas() {
  let inputPagina = document.getElementById("inputPaginaNoCompletadas");
  if (inputPagina.value != "") {
    inputPagina.value = parseInt(inputPagina.value) + 1;
    cargarListaTareasNoCompletadasPaginator(inputPagina.value);
  } else {
    inputPagina.value = "1";
    cargarListaTareasNoCompletadasPaginator(inputPagina.value);
  }
}

function pasarSiguienteCompletadas() {
  let inputPagina = document.getElementById("inputPaginaCompletadas");
  if (inputPagina.value != "") {
    inputPagina.value = parseInt(inputPagina.value) + 1;
    cargarListaTareasCompletadasPaginator(inputPagina.value);
  } else {
    inputPagina.value = "1";
    cargarListaTareasCompletadasPaginator(inputPagina.value);
  }
}

function pasarAnteriorCompletadas() {
  let inputPagina = document.getElementById("inputPaginaCompletadas");
  if (inputPagina.value <= 1) {
    inputPagina.value = 1;
  } else {
    inputPagina.value = parseInt(inputPagina.value) - 1;
  }
  cargarListaTareasCompletadasPaginator(inputPagina.value);
}

function indexPaginationCompletadas() {
  let inputPagina = document.getElementById("inputPaginaCompletadas");
  if (this.value == "") {
    inputPagina.value = paginacionGuardadaAnteriorCompletados;
  } else if (this.value <= 1) {
    inputPagina.value = 1;
  }
  cargarListaTareasCompletadasPaginator(
    this.value != "" ? this.value : paginacionGuardadaAnteriorCompletados
  );
}

function indexPaginationNoCompletadas() {
  let inputPagina = document.getElementById("inputPaginaNoCompletadas");
  if (this.value == "") {
    inputPagina.value = paginacionGuardadaAnteriorNoCompletados;
  } else if (this.value <= 1) {
    inputPagina.value = 1;
  }
  cargarListaTareasNoCompletadasPaginator(
    this.value != "" ? this.value : paginacionGuardadaAnteriorNoCompletados
  );
}

function abrirModalEditarTarea(event) {
  let modalEditarTarea = document.getElementById("modalEditarTarea");
  modalEditarTarea.style.display = "block";

  document.getElementById("taskNameEdit").value =
    event.currentTarget.parentElement.parentElement.children[0].innerHTML;
  document.getElementById("taskDescriptionEdit").value =
    event.currentTarget.parentElement.parentElement.children[1].innerHTML;

  checkedSeleccionado =
    event.currentTarget.parentElement.parentElement.children[4].children[1]
      .checked;

  objectIdSeleccionado =
    event.currentTarget.parentElement.parentElement.getAttribute("objectId");
}

function abrirModalCrearTarea() {
  let modalCrearTarea = document.getElementById("modalCrearTarea");
  modalCrearTarea.style.display = "block";
}

function abrirModalBorrarTarea(event) {
  let modalCrearTarea = document.getElementById("modalBorrarTarea");
  modalCrearTarea.style.display = "block";

  objectIdSeleccionado =
    event.currentTarget.parentElement.parentElement.getAttribute("objectId");
}

function editarTarea(event) {
  let inputNombre = document.getElementById("taskNameEdit").value;
  let inputDescripcion = document.getElementById("taskDescriptionEdit").value;
  if (inputNombre !== "") {
    editarTareaFetch(inputNombre, inputDescripcion);
  }
}

function cerrarModalCrearTarea() {
  let modalCrearTarea = document.getElementById("modalCrearTarea");
  modalCrearTarea.style.display = "none";
}

function cerrarModalEditarTarea() {
  let modalEditarTarea = document.getElementById("modalEditarTarea");
  modalEditarTarea.style.display = "none";
}

function cancelarBorrarTarea() {
  let modalCrearTarea = document.getElementById("modalBorrarTarea");
  modalCrearTarea.style.display = "none";
}

function cerrarModalBorrarTarea() {
  let modalBorrarTarea = document.getElementById("modalBorrarTarea");
  modalBorrarTarea.style.display = "none";
}

function cerrarModalMostrarMas() {
  let modalMostrarMas = document.getElementById("modalMostrarMas");
  modalMostrarMas.style.display = "none";
}

function botonCrearTarea() {
  let inputNombre = document.getElementById("taskNameCreate").value;
  let inputDescripcion = document.getElementById("taskDescriptionCreate").value;

  if (inputNombre !== "") {
    crearTareaFecth(inputNombre, inputDescripcion);
  }
}

function cerrarModalCancelarCrearTarea() {
  let modalCrearProyecto = document.getElementById("modalCrearTarea");
  modalCrearProyecto.style.display = "none";

  document.getElementById("taskNameCreate").value = "";
  document.getElementById("taskDescriptionCreate").value = "";
}

function cambiarCompletoIncompleto(event) {
  fetch(`${urlGlobal}updateTarea`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: event.currentTarget.parentElement.parentElement.getAttribute(
        "objectid"
      ),
      titulo:
        event.currentTarget.parentElement.parentElement.children[0].innerHTML,
      descripcion:
        event.currentTarget.parentElement.parentElement.children[1].innerHTML,
      completado: event.currentTarget.checked,
    }),
  })
    .then((response) => response.json())
    .then(function (data) {
      paginacionCompletados = document.getElementById(
        "inputPaginaCompletadas"
      ).value;
      paginacionNoCompletados = document.getElementById(
        "inputPaginaNoCompletadas"
      ).value;
      fetch("croniumTareas.html")
        .then((response) => response.text())
        .then((data) => {
          document.getElementById("contenedorTareas").innerHTML = data;
          cargarListaTareasCompletadasPaginator(paginacionCompletados);
          cargarListaTareasNoCompletadasPaginator(paginacionNoCompletados);
          cargarEventos();
        });
    });
}

function volverAtras() {
  window.location.href = "croniumProyectos.html";
}
