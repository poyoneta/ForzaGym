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
        telefono: document.getElementById("telefono").value, // ✨ AGREGADO: Captura el valor del celular
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
            body: JSON.stringify(socio) // Ahora incluye la propiedad "telefono"
        });

    const datos = await respuesta.json();

    // Si datos.message no existe, muestra el texto de éxito por defecto
    alert(datos.message || "¡Socio registrado con éxito!"); 

    // Limpia el formulario después de registrarse para que quede prolijo
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
            // Se asume que la propiedad que viene de la base de datos se llama "Telefono"
            // Si viene nulo o vacío, muestra "Sin teléfono"
            const telMostrado = socio.Telefono ? socio.Telefono : "Sin teléfono";

            lista.innerHTML += `
                <p>
                    <strong>${socio.Nombre}</strong> 
                    - ${socio.PlanElegido} 
                    - 📞 ${telMostrado}
                </p>
            `;
        });
    }
});