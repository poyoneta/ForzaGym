console.log("Script funcionando correctamente");

alert("¡Bienvenido al Gimnasio Forza!");


document
.getElementById("formulario")
.addEventListener("submit",
async (e) => {

    e.preventDefault();

    console.log("Formulario enviado");

    const socio = {

        nombre:
        document.getElementById("nombre").value,

        email:
        document.getElementById("email").value,

        plan:
        document.getElementById("plan").value,

        mensaje:
        document.getElementById("mensaje").value

    };

    const respuesta =
        await fetch("/api/socios", {

            method: "POST",

            headers: {
                "Content-Type":
                "application/json"
            },

            body:
            JSON.stringify(socio)

        });

    const datos =
        await respuesta.json();

    alert(datos.mensaje);

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

    lista.innerHTML = "";

    socios.forEach(socio => {

        lista.innerHTML += `
            <p>
                ${socio.Nombre}
                -
                ${socio.Plan}
            </p>
        `;

    });

});