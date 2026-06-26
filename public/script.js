console.log("Script funcionando correctamente");

alert("¡Bienvenido al Gimnasio Forza!");

document
.getElementById("formulario")
.addEventListener("submit",
async (e) => {

    e.preventDefault();

    console.log("Formulario enviado");

    const socio = {
        nombre: document.getElementById("nombre").value,
        email: document.getElementById("email").value,
        planElegido: document.getElementById("plan").value, 
        mensaje: document.getElementById("mensaje").value
    };

    const respuesta =
        await fetch("/api/socios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(socio)
        });

    const datos = await respuesta.json();

    // ✨ CORRECCIÓN: Si datos.message no existe, muestra el texto de éxito por defecto
    alert(datos.message || "¡Socio registrado con éxito!"); 

    // Opcional: limpia el formulario después de registrarse para que quede prolijo
    if (respuesta.ok) {
        document.getElementById("formulario").reset();
    }
});

document
.getElementById("verSocios")
.addEventListener("click",
async () => {

    const respuesta =
        await fetch("/api/socios");

    const socios =
        await respuesta.json();

    const lista =
        document.getElementById("lista");

    if (lista) { 
        lista.innerHTML = "";

        socios.forEach(socio => {
            lista.innerHTML += `
                <p>
                    ${socio.Nombre}
                    -
                    ${socio.PlanElegido} 
                </p>
            `;
        });
    }
});