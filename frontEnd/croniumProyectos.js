cargarHeader();
cargarListadoProyectos();
cargarEventos();

var objectIdSeleccionado;

function cargarListadoProyectos() {
  fetch(`${urlGlobal}searchProyectos`)
    .then((response) => response.json())
    .then(function (data) {
      crearDivsListadoProyectos(data);
    });
}

function crearProyectoFecth(nombre, descripcion) {
  fetch(`${urlGlobal}insertProyecto`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nombre: nombre, descripcion: descripcion }),
  })
    .then((response) => response.json())
    .then(function (data) {
      fetch("croniumProyectos.html")
        .then((response) => response.text())
        .then((data) => {
          document.getElementById("contenedorProyectos").innerHTML = data;
          cargarListadoProyectos();
          cargarEventos();
        });
    });
}

function editarProyectoFetch(nombre, descripcion) {
  fetch(`${urlGlobal}updateProyecto`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: objectIdSeleccionado,
      nombre: nombre,
      descripcion: descripcion,
    }),
  })
    .then((response) => response.json())
    .then(function (data) {
      fetch("croniumProyectos.html")
        .then((response) => response.text())
        .then((data) => {
          document.getElementById("contenedorProyectos").innerHTML = data;
          cargarListadoProyectos();
          cargarEventos();
        });
    });
}

function borrarProyecto(event) {
  fetch(`${urlGlobal}deleteProyecto`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: objectIdSeleccionado }),
  })
    .then((response) => response.json())
    .then(function (data) {
      borrarTareas();
    });
}

function borrarTareas() {
  fetch(`${urlGlobal}deleteTareas`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: objectIdSeleccionado }),
  })
    .then((response) => response.json())
    .then(function (data) {
      fetch("croniumProyectos.html")
        .then((response) => response.text())
        .then((data) => {
          document.getElementById("contenedorProyectos").innerHTML = data;
          cargarListadoProyectos();
          cargarEventos();
        });
    });
}

function crearDivsListadoProyectos(data) {
  let divGridProyectos = document.getElementById("contenedorGridProyectos");

  for (let key in data) {
    const proyecto = data[key];
    let divProyecto = document.createElement("div");
    divProyecto.classList.add("divProyectos");
    divProyecto.setAttribute("objectId", proyecto.id);

    let spanBorrarProyecto = document.createElement("span");
    spanBorrarProyecto.classList.add("material-symbols-outlined");
    spanBorrarProyecto.style.fontSize = "32px";
    spanBorrarProyecto.style.cursor = "pointer";
    spanBorrarProyecto.textContent = "delete";
    spanBorrarProyecto.style.padding = "7px";
    spanBorrarProyecto.addEventListener("click", abrirModalBorrarProyecto);

    let spanEditarProyecto = document.createElement("span");
    spanEditarProyecto.classList.add("material-symbols-outlined");
    spanEditarProyecto.style.fontSize = "32px";
    spanEditarProyecto.style.cursor = "pointer";
    spanEditarProyecto.textContent = "edit";
    spanEditarProyecto.style.padding = "7px";
    spanEditarProyecto.addEventListener("click", abrirModalEditarProyecto);

    let spanIrATareas = document.createElement("span");
    spanIrATareas.classList.add("material-symbols-outlined");
    spanIrATareas.style.fontSize = "32px";
    spanIrATareas.style.cursor = "pointer";
    spanIrATareas.textContent = "checkbook";
    spanIrATareas.style.padding = "7px";
    spanIrATareas.addEventListener("click", irATareaProyecto);

    let divElementosBotones = document.createElement("div");
    divElementosBotones.style.display = "flex";
    divElementosBotones.style.justifyContent = "space-between";
    divElementosBotones.appendChild(spanBorrarProyecto);
    divElementosBotones.appendChild(spanEditarProyecto);
    divElementosBotones.appendChild(spanIrATareas);

    let pNombreProyecto = document.createElement("p");
    pNombreProyecto.style.fontWeight = "bold";
    pNombreProyecto.style.fontSize = "20px";
    pNombreProyecto.textContent = proyecto.nombre;
    pNombreProyecto.classList.add("controlTexto");

    let pDescripcionProyecto = document.createElement("p");
    pDescripcionProyecto.textContent = proyecto.descripcion;
    pDescripcionProyecto.classList.add("controlTexto");
    pDescripcionProyecto.classList.add("textoRecortado");

    divProyecto.appendChild(pNombreProyecto);
    divProyecto.appendChild(pDescripcionProyecto);
    divProyecto.appendChild(divElementosBotones);
    divGridProyectos.appendChild(divProyecto);
  }

  const pDescripcionProyectos = document.querySelectorAll(".textoRecortado");

  pDescripcionProyectos.forEach((textoDescripcionProyectos) => {
    // Crea el botón Mostrar más
    const btnMostrarMas = document.createElement("button");
    btnMostrarMas.innerText = "Mostrar más";
    btnMostrarMas.classList.add("btnMostrarMas");
    btnMostrarMas.style.visibility = "hidden"; // Oculta por defecto

    // Añade el botón al DOM
    textoDescripcionProyectos.parentNode.insertBefore(
      btnMostrarMas,
      textoDescripcionProyectos.nextSibling
    );

    // Verifica si el texto está cortado
    if (
      textoDescripcionProyectos.scrollHeight >
      textoDescripcionProyectos.clientHeight
    ) {
      btnMostrarMas.style.visibility = "visible"; // Muestra el botón si el texto está cortado
    }

    // Agrega evento de clic al botón
    btnMostrarMas.addEventListener("click", modalMostrarMas);
  });
}

function cargarEventos() {
  document
    .getElementById("buttonFlexCreacionProyectos")
    .addEventListener("click", abrirModalCrearProyecto);
  document
    .getElementById("closeCrearProyecto")
    .addEventListener("click", cerrarModalCrearProyecto);
  document
    .getElementById("btnCancelarCreateProject")
    .addEventListener("click", cerrarModalCancelarCrearProyecto);
  document
    .getElementById("closeEditarProyecto")
    .addEventListener("click", cerrarModalEditarProyecto);
  document
    .getElementById("btnCancelarEditProject")
    .addEventListener("click", cerrarModalEditarProyecto);
  document
    .getElementById("btnCreateProject")
    .addEventListener("click", botonCrearProyecto);
  document
    .getElementById("btnEditProject")
    .addEventListener("click", editarProyecto);
  document
    .getElementById("btnCancelarDeleteProject")
    .addEventListener("click", cancelarBorrarProyecto);
  document
    .getElementById("closeBorrarProyecto")
    .addEventListener("click", cerrarModalBorrarProyecto);
  document
    .getElementById("btnAceptarMostrarMas")
    .addEventListener("click", cerrarModalMostrarMas);
  document
    .getElementById("closeMostrarMas")
    .addEventListener("click", cerrarModalMostrarMas);

  document
    .getElementById("btnAceptarDeleteProject")
    .addEventListener("click", borrarProyecto);
}

function modalMostrarMas(event) {
  let modalMostrarMas = document.getElementById("modalMostrarMas");
  document.getElementById("tituloMostrarMás").innerHTML =
    event.currentTarget.parentElement.children[0].innerHTML;
  document.getElementById("contenidoMostrarMas").innerHTML =
    event.currentTarget.parentElement.children[1].innerHTML;

  modalMostrarMas.style.display = "block";
}

function abrirModalCrearProyecto() {
  let modalCrearProyecto = document.getElementById("modalCrearProyecto");
  modalCrearProyecto.style.display = "block";
}

function cerrarModalCrearProyecto() {
  let modalCrearProyecto = document.getElementById("modalCrearProyecto");
  modalCrearProyecto.style.display = "none";
}

function cerrarModalCancelarCrearProyecto() {
  let modalCrearProyecto = document.getElementById("modalCrearProyecto");
  modalCrearProyecto.style.display = "none";

  document.getElementById("projectNameCreate").value = "";
  document.getElementById("projectDescriptionCreate").value = "";
}

function cerrarModalEditarProyecto() {
  let modalCrearProyecto = document.getElementById("modalEditarProyecto");
  modalCrearProyecto.style.display = "none";
}

function cerrarModalBorrarProyecto() {
  let modalBorrarTarea = document.getElementById("modalBorrarProyecto");
  modalBorrarTarea.style.display = "none";
}

function cerrarModalMostrarMas() {
  let modalMostrarMas = document.getElementById("modalMostrarMas");
  modalMostrarMas.style.display = "none";
}

function botonCrearProyecto() {
  let inputNombre = document.getElementById("projectNameCreate").value;
  let inputDescripcion = document.getElementById(
    "projectDescriptionCreate"
  ).value;

  if (inputNombre !== "") {
    crearProyectoFecth(inputNombre, inputDescripcion);
  }
}

function abrirModalBorrarProyecto(event) {
  let modalBorrarProyecto = document.getElementById("modalBorrarProyecto");
  modalBorrarProyecto.style.display = "block";

  objectIdSeleccionado =
    event.currentTarget.parentElement.parentElement.getAttribute("objectId");
}

function abrirModalEditarProyecto(event) {
  let modalEditarProyecto = document.getElementById("modalEditarProyecto");
  modalEditarProyecto.style.display = "block";

  document.getElementById("projectNameEdit").value =
    event.currentTarget.parentElement.parentElement.children[0].innerHTML;
  document.getElementById("projectDescriptionEdit").value =
    event.currentTarget.parentElement.parentElement.children[1].innerHTML;

  objectIdSeleccionado =
    event.currentTarget.parentElement.parentElement.getAttribute("objectId");
}

function editarProyecto(event) {
  let inputNombre = document.getElementById("projectNameEdit").value;
  let inputDescripcion = document.getElementById(
    "projectDescriptionEdit"
  ).value;
  if (inputNombre !== "") {
    editarProyectoFetch(inputNombre, inputDescripcion);
  }
}

function irATareaProyecto(event) {
  objectIdSeleccionado =
    event.currentTarget.parentElement.parentElement.getAttribute("objectId");

  window.location.href = `croniumTareas.html?objectID=${objectIdSeleccionado}&nombreProyecto=${event.currentTarget.parentElement.parentElement.children[0].innerHTML}`;
}

function cancelarBorrarProyecto() {
  let modalBorrarProyecto = document.getElementById("modalBorrarProyecto");
  modalBorrarProyecto.style.display = "none";
}
