console.log("Script funcionando correctamente");

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

    const respuesta = await fetch("/api/socios");
    const socios = await respuesta.json();

    // 🕵️‍♂️ ESTO ES CLAVE: Mirá la consola del navegador (F12) para ver cómo llega el objeto
    console.log("Socios recibidos desde el backend:", socios);

    const lista = document.getElementById("lista");

    if (lista) { 
        lista.innerHTML = "";

        socios.forEach(socio => {
            // Evaluamos todas las variantes posibles por si las dudas
            const telMostrado = socio.Telefono || socio.telefono || "Sin teléfono";

            lista.innerHTML += `
                <p>
                    <strong>${socio.Nombre || socio.nombre}</strong> 
                    - Plan: ${socio.PlanElegido || socio.planElegido} 
                    - 📞 Tel: ${telMostrado}
                </p>
            `;
        });
    }
});