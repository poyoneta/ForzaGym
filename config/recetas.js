// =====================================================================
// RECETARIO DE FORZA GYM
// ---------------------------------------------------------------------
// Cada receta es UNA porción "base". El generador de planes ajusta la
// porción (x0.75, x1.25, etc.) según las calorías de cada socio.
//
// tipo:   'desayuno'  -> desayunos y meriendas
//         'principal' -> almuerzos y cenas
//         'colacion'  -> colaciones entre comidas
// kcal, p (proteínas g), c (carbohidratos g), g (grasas g): por porción base (valores aproximados)
// min:    minutos de preparación
// tags:   'veg' vegetariano · 'sintacc' sin gluten · 'sinlactosa' sin lácteos
//         'liviano' ideal para bajar de peso · 'energetico' ideal para ganar masa
// ing:    [cantidad, unidad, ingrediente]  (unidad: g, ml, u, cda, cdita, taza, o null = "a gusto")
//
// Para agregar una receta: copiá una y cambiá el id (único), nombre y datos.
// =====================================================================

module.exports = [
    // ======================= DESAYUNOS Y MERIENDAS =======================
    {
        id: 'avena-banana', tipo: 'desayuno', nombre: 'Avena cocida con banana y canela',
        kcal: 365, p: 15, c: 62, g: 5, min: 10, tags: ['veg', 'energetico'],
        ing: [[50, 'g', 'avena arrollada'], [200, 'ml', 'leche descremada'], [1, 'u', 'banana'], [null, null, 'canela']],
        pasos: ['Poné la avena con la leche en una olla a fuego bajo.', 'Revolvé 4-5 minutos hasta que espese.', 'Serví con la banana en rodajas y canela por encima.']
    },
    {
        id: 'tostadas-palta-huevo', tipo: 'desayuno', nombre: 'Tostadas integrales con palta y huevo',
        kcal: 415, p: 19, c: 30, g: 24, min: 10, tags: ['veg', 'sinlactosa'],
        ing: [[2, 'u', 'rebanadas de pan integral'], [0.5, 'u', 'palta'], [2, 'u', 'huevos'], [null, null, 'sal, pimienta y limón']],
        pasos: ['Tostá el pan.', 'Pisá la palta con unas gotas de limón, sal y pimienta.', 'Cociná los huevos a la plancha o revueltos.', 'Untá las tostadas con la palta y poné los huevos arriba.']
    },
    {
        id: 'yogur-granola', tipo: 'desayuno', nombre: 'Yogur con granola y frutillas',
        kcal: 292, p: 13, c: 45, g: 6, min: 3, tags: ['veg', 'liviano'],
        ing: [[200, 'g', 'yogur natural descremado'], [30, 'g', 'granola sin azúcar'], [100, 'g', 'frutillas'], [1, 'cdita', 'miel']],
        pasos: ['Serví el yogur en un bowl.', 'Agregá las frutillas cortadas y la granola.', 'Terminá con un hilo de miel.']
    },
    {
        id: 'licuado-mani', tipo: 'desayuno', nombre: 'Licuado de banana, avena y mantequilla de maní',
        kcal: 365, p: 16, c: 52, g: 10, min: 5, tags: ['veg', 'energetico'],
        ing: [[250, 'ml', 'leche descremada'], [1, 'u', 'banana'], [2, 'cda', 'avena'], [1, 'cda', 'mantequilla de maní']],
        pasos: ['Poné todo en la licuadora.', 'Licuá 1 minuto hasta que quede cremoso.', 'Si te gusta frío, agregá un par de cubos de hielo.']
    },
    {
        id: 'panqueques-avena', tipo: 'desayuno', nombre: 'Panqueques de avena y banana',
        kcal: 360, p: 20, c: 50, g: 8, min: 15, tags: ['veg', 'sinlactosa'],
        ing: [[40, 'g', 'avena'], [1, 'u', 'huevo'], [2, 'u', 'claras'], [1, 'u', 'banana'], [null, null, 'canela y esencia de vainilla']],
        pasos: ['Licuá o pisá la avena con la banana, el huevo, las claras, la canela y la vainilla.', 'Calentá una sartén antiadherente apenas aceitada.', 'Cociná cucharones de mezcla 2 minutos de cada lado.', 'Serví con fruta fresca.']
    },
    {
        id: 'omelette-espinaca', tipo: 'desayuno', nombre: 'Omelette de espinaca y queso con tostada',
        kcal: 314, p: 26, c: 15, g: 16, min: 10, tags: ['veg', 'liviano'],
        ing: [[2, 'u', 'huevos'], [1, 'u', 'clara'], [50, 'g', 'espinaca'], [30, 'g', 'queso port salut light'], [1, 'u', 'rebanada de pan integral']],
        pasos: ['Batí los huevos y la clara con sal y pimienta.', 'Saltá la espinaca un minuto en una sartén.', 'Agregá el huevo, y cuando empiece a cuajar poné el queso y doblá al medio.', 'Acompañá con la tostada.']
    },
    {
        id: 'tostadas-ricota', tipo: 'desayuno', nombre: 'Tostadas con ricota, tomate y orégano',
        kcal: 275, p: 16, c: 33, g: 7, min: 5, tags: ['veg', 'liviano'],
        ing: [[2, 'u', 'rebanadas de pan integral'], [80, 'g', 'ricota magra'], [1, 'u', 'tomate'], [null, null, 'orégano, sal y aceite de oliva']],
        pasos: ['Tostá el pan.', 'Untá la ricota.', 'Poné rodajas de tomate, orégano, sal y unas gotas de aceite de oliva.']
    },
    {
        id: 'bowl-griego', tipo: 'desayuno', nombre: 'Bowl de yogur griego con kiwi y chía',
        kcal: 254, p: 19, c: 32, g: 6, min: 5, tags: ['veg', 'sintacc', 'liviano'],
        ing: [[170, 'g', 'yogur griego natural'], [1, 'u', 'kiwi'], [0.5, 'u', 'banana'], [1, 'cda', 'semillas de chía']],
        pasos: ['Serví el yogur en un bowl.', 'Cortá el kiwi y la banana en rodajas.', 'Poné la fruta arriba y espolvoreá la chía.']
    },
    {
        id: 'pudding-chia', tipo: 'desayuno', nombre: 'Pudding de chía con frutos rojos',
        kcal: 236, p: 6, c: 30, g: 11, min: 5, tags: ['veg', 'sintacc', 'sinlactosa', 'liviano'],
        ing: [[3, 'cda', 'semillas de chía'], [200, 'ml', 'bebida de almendras'], [80, 'g', 'frutos rojos'], [1, 'cdita', 'miel']],
        pasos: ['La noche anterior mezclá la chía con la bebida de almendras y la miel.', 'Dejalo en la heladera toda la noche (se pone espeso).', 'A la mañana agregá los frutos rojos.']
    },
    {
        id: 'revuelto-queso-manzana', tipo: 'desayuno', nombre: 'Huevos revueltos con queso y una manzana',
        kcal: 370, p: 23, c: 22, g: 20, min: 8, tags: ['veg', 'sintacc'],
        ing: [[3, 'u', 'huevos'], [20, 'g', 'queso rallado'], [1, 'u', 'manzana'], [null, null, 'sal y pimienta']],
        pasos: ['Batí los huevos con sal y pimienta.', 'Cocinalos revolviendo en una sartén a fuego bajo.', 'Agregá el queso al final, que se derrita.', 'Acompañá con la manzana.']
    },
    {
        id: 'mate-tostadas', tipo: 'desayuno', nombre: 'Mate cocido con tostadas, queso untable y mermelada',
        kcal: 240, p: 11, c: 38, g: 4, min: 5, tags: ['veg', 'liviano'],
        ing: [[2, 'u', 'rebanadas de pan integral'], [40, 'g', 'queso untable light'], [2, 'cda', 'mermelada light'], [1, 'u', 'saquito de mate cocido']],
        pasos: ['Prepará el mate cocido.', 'Tostá el pan.', 'Untá con el queso y la mermelada.']
    },
    {
        id: 'licuado-verde', tipo: 'desayuno', nombre: 'Licuado verde con yogur y avena',
        kcal: 300, p: 11, c: 55, g: 4, min: 5, tags: ['veg', 'liviano'],
        ing: [[30, 'g', 'espinaca'], [1, 'u', 'banana'], [1, 'u', 'manzana verde'], [150, 'g', 'yogur natural descremado'], [2, 'cda', 'avena']],
        pasos: ['Lavá la espinaca y cortá la manzana.', 'Licuá todo con medio vaso de agua fría.', 'Tomalo enseguida.']
    },
    {
        id: 'sandwich-jamon-queso', tipo: 'desayuno', nombre: 'Sándwich integral de jamón, queso y tomate',
        kcal: 270, p: 20, c: 30, g: 8, min: 5, tags: [],
        ing: [[2, 'u', 'rebanadas de pan integral'], [30, 'g', 'jamón cocido natural'], [30, 'g', 'queso de máquina light'], [0.5, 'u', 'tomate']],
        pasos: ['Armá el sándwich con el jamón, el queso y el tomate.', 'Si querés, pasalo por la sandwichera 3 minutos.']
    },
    {
        id: 'overnight-oats', tipo: 'desayuno', nombre: 'Avena de la noche con yogur y maní',
        kcal: 455, p: 21, c: 60, g: 14, min: 5, tags: ['veg', 'energetico'],
        ing: [[50, 'g', 'avena'], [150, 'g', 'yogur natural'], [100, 'ml', 'leche descremada'], [80, 'g', 'frutos rojos'], [1, 'cda', 'mantequilla de maní']],
        pasos: ['La noche anterior mezclá en un frasco la avena, el yogur y la leche.', 'Tapalo y dejalo en la heladera.', 'A la mañana agregá los frutos rojos y la mantequilla de maní.']
    },
    {
        id: 'galletas-arroz-palta', tipo: 'desayuno', nombre: 'Galletas de arroz con palta, jamón y tomate',
        kcal: 260, p: 12, c: 28, g: 11, min: 5, tags: ['sintacc', 'sinlactosa', 'liviano'],
        ing: [[4, 'u', 'galletas de arroz'], [0.25, 'u', 'palta'], [2, 'u', 'fetas de jamón cocido'], [0.5, 'u', 'tomate']],
        pasos: ['Pisá la palta con sal.', 'Untá las galletas.', 'Poné el jamón y rodajas finas de tomate.']
    },
    {
        id: 'panqueque-banana-huevo', tipo: 'desayuno', nombre: 'Panqueques de banana y huevo (sin harina)',
        kcal: 250, p: 13, c: 28, g: 10, min: 10, tags: ['veg', 'sintacc', 'sinlactosa', 'liviano'],
        ing: [[2, 'u', 'huevos'], [1, 'u', 'banana madura'], [1, 'cdita', 'cacao amargo'], [null, null, 'canela']],
        pasos: ['Pisá la banana y mezclala con los huevos, el cacao y la canela.', 'Cociná pequeños panqueques en sartén antiadherente, 1-2 minutos por lado.', 'Serví con fruta.']
    },
    {
        id: 'cafe-con-leche-tostado', tipo: 'desayuno', nombre: 'Café con leche y tostado de pan árabe',
        kcal: 330, p: 22, c: 38, g: 9, min: 7, tags: [],
        ing: [[200, 'ml', 'leche descremada'], [1, 'u', 'pan árabe integral'], [30, 'g', 'jamón cocido natural'], [30, 'g', 'queso de máquina light']],
        pasos: ['Prepará el café con la leche caliente.', 'Rellená el pan árabe con jamón y queso.', 'Tostalo en sartén o sandwichera hasta que se derrita el queso.']
    },

    // ======================= ALMUERZOS Y CENAS =======================
    {
        id: 'pollo-calabaza', tipo: 'principal', nombre: 'Pollo al horno con calabaza y papa',
        kcal: 462, p: 45, c: 37, g: 15, min: 45, tags: ['sintacc', 'sinlactosa', 'liviano'],
        ing: [[180, 'g', 'pechuga de pollo'], [250, 'g', 'calabaza'], [100, 'g', 'papa'], [1, 'cda', 'aceite de oliva'], [null, null, 'romero, ajo, sal y pimienta']],
        pasos: ['Prendé el horno a 200 °C.', 'Cortá la calabaza y la papa en cubos, y condimentá todo con aceite, romero, ajo, sal y pimienta.', 'Poné el pollo y las verduras en una fuente.', 'Horneá 35-40 minutos, dando vuelta a la mitad.']
    },
    {
        id: 'milanesas-horno', tipo: 'principal', nombre: 'Milanesas de pollo al horno con ensalada',
        kcal: 516, p: 47, c: 30, g: 21, min: 30, tags: [],
        ing: [[160, 'g', 'pechuga de pollo en filetes'], [30, 'g', 'pan rallado'], [1, 'u', 'huevo'], [1, 'taza', 'lechuga'], [1, 'u', 'tomate'], [1, 'u', 'zanahoria rallada'], [1, 'cda', 'aceite']],
        pasos: ['Pasá los filetes por huevo batido con ajo y perejil, y después por pan rallado.', 'Ponelas en una placa aceitada y horneá a 200 °C, 10 minutos de cada lado.', 'Armá la ensalada y condimentá con el aceite, sal y limón.']
    },
    {
        id: 'tarta-zapallitos', tipo: 'principal', nombre: 'Tarta de zapallitos (porción)',
        kcal: 390, p: 17, c: 35, g: 19, min: 50, tags: ['veg', 'liviano'],
        ing: [[0.25, 'u', 'tapa de tarta light'], [200, 'g', 'zapallitos'], [0.5, 'u', 'cebolla'], [1, 'u', 'huevo'], [40, 'g', 'queso cremoso light'], [null, null, 'sal, pimienta y nuez moscada']],
        pasos: ['Rallá los zapallitos y la cebolla, y saltealos hasta que larguen el agua.', 'Mezclalos con el huevo, el queso en cubos y los condimentos.', 'Rellená la tapa en una tartera y horneá a 180 °C unos 35 minutos.', '(Las cantidades son de una porción: para la tarta entera, multiplicá por 4.)']
    },
    {
        id: 'guiso-lentejas', tipo: 'principal', nombre: 'Guiso de lentejas con carne y verduras',
        kcal: 545, p: 37, c: 65, g: 12, min: 50, tags: ['sintacc', 'sinlactosa', 'energetico'],
        ing: [[70, 'g', 'lentejas secas'], [80, 'g', 'carne magra en cubos (cuadril o roast beef)'], [0.5, 'u', 'cebolla'], [0.5, 'u', 'morrón'], [1, 'u', 'zanahoria'], [100, 'g', 'papa'], [100, 'g', 'tomate triturado'], [1, 'cdita', 'aceite'], [null, null, 'pimentón, comino y laurel']],
        pasos: ['Remojá las lentejas un par de horas (o usá lentejas de lata).', 'Rehogá la cebolla y el morrón en el aceite, y dorá la carne.', 'Agregá la zanahoria, la papa, el tomate, las lentejas y agua o caldo hasta cubrir.', 'Condimentá y cociná a fuego bajo 35-40 minutos.']
    },
    {
        id: 'arroz-pollo', tipo: 'principal', nombre: 'Arroz con pollo y arvejas',
        kcal: 515, p: 40, c: 63, g: 9, min: 35, tags: ['sintacc', 'sinlactosa', 'energetico'],
        ing: [[70, 'g', 'arroz'], [150, 'g', 'pollo en cubos'], [0.5, 'u', 'morrón'], [0.5, 'u', 'cebolla'], [50, 'g', 'arvejas'], [1, 'cdita', 'aceite'], [null, null, 'cúrcuma o azafrán, caldo y sal']],
        pasos: ['Dorá el pollo en el aceite y reservalo.', 'Rehogá la cebolla y el morrón picados.', 'Agregá el arroz, la cúrcuma y el doble de caldo caliente.', 'Volvé a poner el pollo, sumá las arvejas y cociná tapado 18 minutos.']
    },
    {
        id: 'wok-pollo', tipo: 'principal', nombre: 'Wok de pollo y verduras con arroz yamaní',
        kcal: 555, p: 41, c: 55, g: 17, min: 25, tags: ['sinlactosa'],
        ing: [[150, 'g', 'pollo en tiras'], [1, 'taza', 'brócoli'], [1, 'u', 'zanahoria'], [0.5, 'u', 'morrón'], [0.5, 'u', 'cebolla'], [2, 'cda', 'salsa de soja'], [60, 'g', 'arroz yamaní'], [1, 'cda', 'aceite']],
        pasos: ['Cociná el arroz yamaní (tarda unos 40 minutos; podés dejarlo hecho).', 'Saltá el pollo en el wok o sartén bien caliente con el aceite.', 'Agregá las verduras en tiras y salteá 5 minutos (que queden crocantes).', 'Sumá la salsa de soja y serví con el arroz.']
    },
    {
        id: 'merluza-pure-calabaza', tipo: 'principal', nombre: 'Merluza a la plancha con puré de calabaza',
        kcal: 380, p: 37, c: 25, g: 14, min: 25, tags: ['sintacc', 'sinlactosa', 'liviano'],
        ing: [[200, 'g', 'filet de merluza'], [300, 'g', 'calabaza'], [1, 'cda', 'aceite de oliva'], [null, null, 'limón, ajo, perejil y sal']],
        pasos: ['Hervé la calabaza 15 minutos y pisala con sal y nuez moscada.', 'Cociná la merluza a la plancha 3-4 minutos por lado.', 'Serví con aceite de oliva, limón, ajo y perejil por encima.']
    },
    {
        id: 'carne-pure-mixto', tipo: 'principal', nombre: 'Carne magra a la plancha con puré mixto',
        kcal: 430, p: 40, c: 35, g: 13, min: 30, tags: ['sintacc', 'sinlactosa'],
        ing: [[160, 'g', 'bife de cuadril o peceto'], [125, 'g', 'papa'], [125, 'g', 'calabaza'], [1, 'cdita', 'aceite'], [1, 'taza', 'ensalada de hojas verdes']],
        pasos: ['Hervé la papa y la calabaza y pisalas con un chorrito de caldo y sal.', 'Cociná la carne a la plancha al punto que te guste.', 'Serví con el puré y la ensalada.']
    },
    {
        id: 'fideos-bolognesa', tipo: 'principal', nombre: 'Fideos integrales con bolognesa',
        kcal: 515, p: 38, c: 62, g: 12, min: 30, tags: ['energetico'],
        ing: [[80, 'g', 'fideos integrales'], [120, 'g', 'carne picada magra'], [150, 'g', 'salsa de tomate'], [0.5, 'u', 'cebolla'], [1, 'cda', 'queso rallado'], [null, null, 'orégano y ajo']],
        pasos: ['Rehogá la cebolla y el ajo, y dorá la carne.', 'Agregá la salsa y el orégano, y cociná 15 minutos.', 'Hervé los fideos al dente.', 'Serví con la salsa y el queso rallado.']
    },
    {
        id: 'hamburguesas-caseras', tipo: 'principal', nombre: 'Hamburguesas caseras con ensalada',
        kcal: 480, p: 38, c: 35, g: 18, min: 25, tags: [],
        ing: [[150, 'g', 'carne picada magra'], [20, 'g', 'avena'], [0.5, 'u', 'huevo'], [1, 'u', 'pan de hamburguesa integral'], [1, 'taza', 'lechuga'], [1, 'u', 'tomate'], [null, null, 'sal, pimienta y ajo']],
        pasos: ['Mezclá la carne con la avena, el huevo y los condimentos.', 'Formá 2 medallones finos.', 'Cocinalos a la plancha 4 minutos por lado.', 'Armá la hamburguesa con lechuga y tomate, y sumá más ensalada al costado.']
    },
    {
        id: 'ensalada-quinoa', tipo: 'principal', nombre: 'Ensalada de quinoa, garbanzos y palta',
        kcal: 460, p: 17, c: 62, g: 15, min: 20, tags: ['veg', 'sintacc', 'sinlactosa'],
        ing: [[60, 'g', 'quinoa'], [100, 'g', 'garbanzos cocidos'], [1, 'u', 'tomate'], [0.5, 'u', 'pepino'], [0.25, 'u', 'cebolla morada'], [0.25, 'u', 'palta'], [1, 'cdita', 'aceite de oliva'], [null, null, 'limón y sal']],
        pasos: ['Lavá bien la quinoa y hervila 15 minutos.', 'Dejala enfriar.', 'Mezclá con los garbanzos y las verduras cortadas.', 'Condimentá con aceite, limón y sal, y poné la palta arriba.']
    },
    {
        id: 'pastel-papa', tipo: 'principal', nombre: 'Pastel de papa liviano',
        kcal: 450, p: 35, c: 42, g: 15, min: 50, tags: ['sintacc'],
        ing: [[130, 'g', 'carne picada magra'], [250, 'g', 'papa'], [50, 'ml', 'leche descremada'], [0.5, 'u', 'cebolla'], [0.5, 'u', 'morrón'], [0.5, 'u', 'huevo duro'], [1, 'cda', 'queso rallado']],
        pasos: ['Hacé un puré con la papa y la leche.', 'Rehogá la cebolla y el morrón, y cociná la carne con sal, comino y pimentón.', 'Armá en una fuente: la carne con el huevo picado abajo y el puré arriba.', 'Espolvoreá el queso y gratiná 15 minutos en el horno.']
    },
    {
        id: 'tortilla-papa-espinaca', tipo: 'principal', nombre: 'Tortilla de papa y espinaca',
        kcal: 450, p: 22, c: 40, g: 22, min: 35, tags: ['veg', 'sintacc', 'sinlactosa'],
        ing: [[2, 'u', 'huevos'], [1, 'u', 'clara'], [200, 'g', 'papa'], [100, 'g', 'espinaca'], [0.5, 'u', 'cebolla'], [1, 'cda', 'aceite']],
        pasos: ['Cortá la papa en láminas finas y cocinala en una sartén tapada con el aceite y la cebolla.', 'Agregá la espinaca hasta que se achique.', 'Mezclá con los huevos batidos y volvé a la sartén.', 'Cuando cuaje abajo, dala vuelta con un plato y terminá 3 minutos.']
    },
    {
        id: 'pollo-limon-yamani', tipo: 'principal', nombre: 'Pollo al limón con arroz yamaní y brócoli',
        kcal: 476, p: 42, c: 52, g: 9, min: 30, tags: ['sintacc', 'sinlactosa'],
        ing: [[160, 'g', 'pechuga de pollo'], [60, 'g', 'arroz yamaní'], [150, 'g', 'brócoli'], [1, 'cdita', 'aceite'], [null, null, 'jugo de limón, ajo y sal']],
        pasos: ['Marina el pollo con limón, ajo y sal 10 minutos.', 'Cocinalo a la plancha.', 'Hervé el brócoli 4 minutos (que quede verde).', 'Serví con el arroz yamaní.']
    },
    {
        id: 'cerdo-batata', tipo: 'principal', nombre: 'Solomillo de cerdo con batatas al horno',
        kcal: 490, p: 37, c: 52, g: 14, min: 40, tags: ['sintacc', 'sinlactosa', 'energetico'],
        ing: [[160, 'g', 'solomillo de cerdo'], [250, 'g', 'batata'], [1, 'cdita', 'aceite'], [1, 'taza', 'ensalada verde'], [null, null, 'pimentón, romero y sal']],
        pasos: ['Cortá la batata en bastones y condimentala con aceite y pimentón.', 'Horneá a 200 °C 30 minutos.', 'Sellá el solomillo en sartén y terminalo en el horno 12-15 minutos.', 'Cortalo en medallones y serví con la ensalada.']
    },
    {
        id: 'ensalada-atun', tipo: 'principal', nombre: 'Ensalada completa de atún',
        kcal: 455, p: 42, c: 32, g: 15, min: 20, tags: ['sintacc', 'sinlactosa', 'liviano'],
        ing: [[1, 'u', 'lata de atún al natural'], [2, 'u', 'huevos duros'], [150, 'g', 'papa'], [100, 'g', 'chauchas'], [1, 'u', 'tomate'], [1, 'cdita', 'aceite de oliva'], [null, null, 'limón y sal']],
        pasos: ['Hervé la papa en cubos y las chauchas.', 'Cociná los huevos 10 minutos.', 'Mezclá todo con el atún escurrido y el tomate.', 'Condimentá con aceite, limón y sal.']
    },
    {
        id: 'wrap-pollo', tipo: 'principal', nombre: 'Wraps de pollo, palta y verduras',
        kcal: 457, p: 35, c: 42, g: 16, min: 15, tags: [],
        ing: [[2, 'u', 'tortillas de trigo integral'], [120, 'g', 'pollo en tiras'], [1, 'taza', 'lechuga'], [1, 'u', 'tomate'], [30, 'g', 'queso crema light'], [0.25, 'u', 'palta']],
        pasos: ['Cociná el pollo a la plancha con pimentón y sal.', 'Calentá las tortillas 20 segundos en sartén.', 'Untá con el queso crema y rellená con el pollo, la palta y las verduras.', 'Enrollá y cortá al medio.']
    },
    {
        id: 'berenjenas-rellenas', tipo: 'principal', nombre: 'Berenjenas rellenas con ricota y arroz integral',
        kcal: 465, p: 22, c: 50, g: 18, min: 45, tags: ['veg', 'sintacc'],
        ing: [[1, 'u', 'berenjena grande'], [80, 'g', 'ricota magra'], [0.5, 'u', 'cebolla'], [0.5, 'u', 'morrón'], [40, 'g', 'mozzarella'], [50, 'g', 'arroz integral'], [null, null, 'orégano y sal']],
        pasos: ['Cortá la berenjena al medio, vaciala y picá la pulpa.', 'Saltá la pulpa con la cebolla y el morrón, y mezclá con la ricota.', 'Rellená, poné la mozzarella arriba y horneá 25 minutos a 200 °C.', 'Acompañá con el arroz integral hervido.']
    },
    {
        id: 'lentejas-curry', tipo: 'principal', nombre: 'Lentejas al curry con arroz',
        kcal: 470, p: 22, c: 82, g: 6, min: 35, tags: ['veg', 'sintacc', 'sinlactosa', 'energetico'],
        ing: [[70, 'g', 'lentejas'], [50, 'g', 'arroz'], [0.5, 'u', 'cebolla'], [100, 'g', 'tomate triturado'], [1, 'taza', 'espinaca'], [1, 'cdita', 'aceite'], [1, 'cdita', 'curry']],
        pasos: ['Rehogá la cebolla en el aceite con el curry.', 'Agregá las lentejas, el tomate y agua, y cociná 25 minutos.', 'Sumá la espinaca al final.', 'Serví con el arroz.']
    },
    {
        id: 'pollo-mostaza-papas', tipo: 'principal', nombre: 'Pollo a la mostaza y miel con papas',
        kcal: 424, p: 38, c: 40, g: 11, min: 40, tags: ['sinlactosa'],
        ing: [[170, 'g', 'muslo de pollo sin piel'], [200, 'g', 'papa'], [1, 'cda', 'mostaza'], [1, 'cdita', 'miel'], [1, 'cdita', 'aceite']],
        pasos: ['Mezclá la mostaza con la miel y pintá el pollo.', 'Cortá las papas en gajos con el aceite y sal.', 'Horneá todo junto 35 minutos a 200 °C.']
    },
    {
        id: 'fideos-pesto-pollo', tipo: 'principal', nombre: 'Fideos con pesto y pollo',
        kcal: 620, p: 42, c: 60, g: 24, min: 25, tags: ['energetico'],
        ing: [[80, 'g', 'fideos'], [120, 'g', 'pollo'], [1, 'taza', 'albahaca fresca'], [1, 'cda', 'aceite de oliva'], [10, 'g', 'nueces'], [1, 'cda', 'queso rallado']],
        pasos: ['Procesá la albahaca con el aceite, las nueces, el queso y un poco de ajo.', 'Cociná el pollo en cubos.', 'Hervé los fideos y mezclalos con el pesto y el pollo.']
    },
    {
        id: 'risotto-pollo-hongos', tipo: 'principal', nombre: 'Risotto de pollo y champiñones',
        kcal: 530, p: 40, c: 58, g: 13, min: 35, tags: ['sintacc'],
        ing: [[70, 'g', 'arroz'], [120, 'g', 'pollo en cubos'], [150, 'g', 'champiñones'], [0.5, 'u', 'cebolla'], [20, 'g', 'queso rallado'], [1, 'cdita', 'manteca'], [null, null, 'caldo caliente']],
        pasos: ['Rehogá la cebolla, sumá el pollo y los champiñones.', 'Agregá el arroz y nacaralo 1 minuto.', 'Incorporá caldo de a un cucharón, revolviendo, durante 18 minutos.', 'Apagá el fuego y mezclá con la manteca y el queso.']
    },
    {
        id: 'albondigas-arroz', tipo: 'principal', nombre: 'Albóndigas en salsa con arroz',
        kcal: 540, p: 36, c: 58, g: 15, min: 40, tags: ['sinlactosa'],
        ing: [[140, 'g', 'carne picada magra'], [0.5, 'u', 'huevo'], [15, 'g', 'pan rallado'], [150, 'g', 'salsa de tomate'], [60, 'g', 'arroz'], [null, null, 'ajo, perejil y sal']],
        pasos: ['Mezclá la carne con el huevo, el pan rallado, ajo y perejil.', 'Formá albóndigas chicas y dorálas en sartén.', 'Agregá la salsa y cociná tapado 15 minutos.', 'Serví con el arroz hervido.']
    },
    {
        id: 'abadejo-papillote', tipo: 'principal', nombre: 'Abadejo al papillote con verduras',
        kcal: 430, p: 36, c: 32, g: 15, min: 30, tags: ['sintacc', 'sinlactosa', 'liviano'],
        ing: [[180, 'g', 'filet de abadejo o merluza'], [1, 'u', 'zucchini'], [1, 'u', 'zanahoria'], [0.5, 'u', 'cebolla'], [150, 'g', 'papa'], [1, 'cda', 'aceite de oliva'], [null, null, 'limón, eneldo y sal']],
        pasos: ['Cortá las verduras en tiras finas y la papa en rodajas finas.', 'Poné todo sobre papel aluminio con el pescado encima.', 'Condimentá con aceite, limón y eneldo, y cerrá bien el paquete.', 'Horneá 20-25 minutos a 200 °C.']
    },
    {
        id: 'pizza-integral', tipo: 'principal', nombre: 'Pizza integral casera (media pizza chica)',
        kcal: 450, p: 22, c: 55, g: 14, min: 40, tags: ['veg'],
        ing: [[120, 'g', 'prepizza integral'], [80, 'g', 'salsa de tomate'], [60, 'g', 'mozzarella light'], [1, 'u', 'tomate'], [null, null, 'orégano y albahaca']],
        pasos: ['Untá la prepizza con la salsa.', 'Agregá la mozzarella y el tomate en rodajas.', 'Horneá 12-15 minutos a 220 °C.', 'Terminá con orégano y albahaca fresca.']
    },
    {
        id: 'tacos-carne', tipo: 'principal', nombre: 'Tacos de carne con palta y verduras',
        kcal: 430, p: 30, c: 38, g: 16, min: 25, tags: ['sintacc', 'sinlactosa'],
        ing: [[3, 'u', 'tortillas de maíz'], [120, 'g', 'carne magra en tiras'], [0.5, 'u', 'morrón'], [0.5, 'u', 'cebolla'], [0.25, 'u', 'palta'], [1, 'u', 'tomate'], [null, null, 'comino, pimentón y limón']],
        pasos: ['Saltá la carne con la cebolla, el morrón y los condimentos.', 'Calentá las tortillas.', 'Rellenalas con la carne, la palta pisada y el tomate picado.', 'Terminá con unas gotas de limón.']
    },
    {
        id: 'sopa-pollo', tipo: 'principal', nombre: 'Sopa de verduras con pollo y fideos finos',
        kcal: 375, p: 32, c: 40, g: 6, min: 35, tags: ['sinlactosa', 'liviano'],
        ing: [[120, 'g', 'pollo'], [30, 'g', 'fideos cabello de ángel'], [200, 'g', 'verduras (zanahoria, zapallo, puerro, apio)'], [1, 'u', 'rebanada de pan integral']],
        pasos: ['Hervé el pollo con las verduras cortadas en 1 litro de agua 25 minutos.', 'Sacá el pollo, desmenuzalo y volvelo a la olla.', 'Agregá los fideos los últimos 3 minutos.', 'Acompañá con el pan.']
    },
    {
        id: 'cesar-liviana', tipo: 'principal', nombre: 'Ensalada César liviana con pollo',
        kcal: 400, p: 45, c: 22, g: 13, min: 20, tags: ['liviano'],
        ing: [[150, 'g', 'pechuga de pollo'], [2, 'taza', 'lechuga'], [30, 'g', 'croutones'], [20, 'g', 'queso rallado'], [50, 'g', 'yogur natural'], [null, null, 'mostaza, limón y ajo']],
        pasos: ['Cociná el pollo a la plancha y cortalo en tiras.', 'Mezclá el yogur con mostaza, limón y ajo para el aderezo.', 'Armá la ensalada con la lechuga, el pollo, los croutones y el queso.', 'Bañá con el aderezo.']
    },
    {
        id: 'bife-ensalada-huevo', tipo: 'principal', nombre: 'Bife con ensalada mixta, huevo y palta',
        kcal: 450, p: 46, c: 10, g: 26, min: 20, tags: ['sintacc', 'sinlactosa', 'liviano'],
        ing: [[180, 'g', 'bife de cuadril o lomo'], [2, 'taza', 'ensalada mixta (lechuga, tomate, cebolla)'], [1, 'u', 'huevo duro'], [0.25, 'u', 'palta'], [1, 'cdita', 'aceite de oliva']],
        pasos: ['Cociná el bife a la plancha.', 'Armá la ensalada con el huevo duro y la palta.', 'Condimentá con el aceite, sal y vinagre.']
    },
    {
        id: 'hamburguesas-lentejas', tipo: 'principal', nombre: 'Hamburguesas de lentejas con ensalada',
        kcal: 450, p: 22, c: 60, g: 14, min: 30, tags: ['veg', 'sinlactosa'],
        ing: [[80, 'g', 'lentejas secas (o 1 lata)'], [20, 'g', 'avena'], [0.5, 'u', 'cebolla'], [1, 'u', 'zanahoria rallada'], [1, 'cda', 'aceite'], [2, 'taza', 'ensalada verde'], [null, null, 'comino, ajo y sal']],
        pasos: ['Cociná las lentejas y pisalas.', 'Mezclalas con la avena, la cebolla, la zanahoria y los condimentos.', 'Formá 2 medallones y dorálos en la sartén con el aceite.', 'Serví con la ensalada.']
    },
    {
        id: 'canelones-verdura', tipo: 'principal', nombre: 'Canelones de verdura y ricota',
        kcal: 440, p: 26, c: 40, g: 18, min: 45, tags: ['veg'],
        ing: [[2, 'u', 'panqueques'], [100, 'g', 'ricota magra'], [150, 'g', 'espinaca o acelga'], [100, 'g', 'salsa de tomate'], [20, 'g', 'queso rallado'], [null, null, 'nuez moscada y sal']],
        pasos: ['Hervé la verdura, escurrila bien y picala.', 'Mezclala con la ricota y los condimentos.', 'Rellená los panqueques y enrollalos.', 'Cubrí con la salsa y el queso, y horneá 20 minutos.']
    },
    {
        id: 'cazuela-pollo-garbanzos', tipo: 'principal', nombre: 'Cazuela de pollo con batata y garbanzos',
        kcal: 445, p: 43, c: 50, g: 9, min: 40, tags: ['sintacc', 'sinlactosa'],
        ing: [[150, 'g', 'pollo en cubos'], [150, 'g', 'batata'], [80, 'g', 'garbanzos cocidos'], [100, 'g', 'tomate triturado'], [0.5, 'u', 'cebolla'], [1, 'cdita', 'aceite'], [null, null, 'pimentón y comino']],
        pasos: ['Dorá el pollo en el aceite con la cebolla.', 'Agregá la batata en cubos, los garbanzos, el tomate y los condimentos.', 'Sumá medio vaso de agua y cociná tapado 25 minutos.']
    },
    {
        id: 'fideos-carne-verduras', tipo: 'principal', nombre: 'Fideos salteados con carne y verduras',
        kcal: 660, p: 42, c: 75, g: 20, min: 25, tags: ['sinlactosa', 'energetico'],
        ing: [[100, 'g', 'fideos'], [130, 'g', 'carne magra en tiras'], [1, 'u', 'zanahoria'], [0.5, 'u', 'morrón'], [0.5, 'u', 'cebolla'], [1, 'cda', 'aceite'], [null, null, 'ajo y jengibre']],
        pasos: ['Hervé los fideos.', 'Saltá la carne en el aceite bien caliente.', 'Agregá las verduras en tiras y el ajo con jengibre.', 'Mezclá con los fideos y salteá 2 minutos más.']
    },
    {
        id: 'arroz-lentejas-huevo', tipo: 'principal', nombre: 'Arroz con lentejas, huevo y verduras',
        kcal: 565, p: 30, c: 75, g: 15, min: 35, tags: ['veg', 'sintacc', 'sinlactosa', 'energetico'],
        ing: [[60, 'g', 'arroz'], [50, 'g', 'lentejas'], [2, 'u', 'huevos'], [0.5, 'u', 'cebolla'], [1, 'u', 'zanahoria'], [1, 'cdita', 'aceite']],
        pasos: ['Hervé el arroz y las lentejas por separado.', 'Rehogá la cebolla y la zanahoria en el aceite.', 'Mezclá todo y poné los huevos a la plancha arriba.']
    },

    // ======================= COLACIONES =======================
    {
        id: 'manzana-nueces', tipo: 'colacion', nombre: 'Manzana con nueces',
        kcal: 178, p: 3, c: 22, g: 10, min: 1, tags: ['veg', 'sintacc', 'sinlactosa'],
        ing: [[1, 'u', 'manzana'], [15, 'g', 'nueces']],
        pasos: ['Cortá la manzana y acompañala con las nueces.']
    },
    {
        id: 'yogur-banana', tipo: 'colacion', nombre: 'Yogur con media banana',
        kcal: 162, p: 9, c: 30, g: 0, min: 1, tags: ['veg', 'sintacc', 'liviano'],
        ing: [[200, 'g', 'yogur descremado'], [0.5, 'u', 'banana']],
        pasos: ['Cortá la banana en el yogur.']
    },
    {
        id: 'huevos-duros', tipo: 'colacion', nombre: 'Huevos duros con tomates cherry',
        kcal: 155, p: 13, c: 3, g: 10, min: 10, tags: ['veg', 'sintacc', 'sinlactosa', 'liviano'],
        ing: [[2, 'u', 'huevos'], [6, 'u', 'tomates cherry']],
        pasos: ['Hervé los huevos 10 minutos y pelalos.', 'Acompañá con los tomates y una pizca de sal.']
    },
    {
        id: 'barrita-avena', tipo: 'colacion', nombre: 'Barrita casera de avena y maní',
        kcal: 200, p: 6, c: 26, g: 8, min: 20, tags: ['veg', 'sinlactosa', 'energetico'],
        ing: [[40, 'g', 'avena'], [1, 'cda', 'miel'], [1, 'cda', 'mantequilla de maní']],
        pasos: ['Mezclá todo (para hacer varias, multiplicá las cantidades).', 'Aplastá la mezcla en una placa con papel manteca.', 'Horneá 12 minutos a 180 °C y cortá en barritas cuando se enfríe.']
    },
    {
        id: 'galletas-mani', tipo: 'colacion', nombre: 'Galletas de arroz con mantequilla de maní',
        kcal: 165, p: 5, c: 16, g: 9, min: 2, tags: ['veg', 'sintacc', 'sinlactosa'],
        ing: [[2, 'u', 'galletas de arroz'], [1, 'cda', 'mantequilla de maní']],
        pasos: ['Untá las galletas con la mantequilla de maní.']
    },
    {
        id: 'zanahoria-hummus', tipo: 'colacion', nombre: 'Bastones de zanahoria con hummus',
        kcal: 130, p: 4, c: 15, g: 6, min: 5, tags: ['veg', 'sintacc', 'sinlactosa', 'liviano'],
        ing: [[100, 'g', 'zanahoria'], [50, 'g', 'hummus']],
        pasos: ['Cortá la zanahoria en bastones y mojá en el hummus.']
    },
    {
        id: 'licuado-banana', tipo: 'colacion', nombre: 'Licuado de banana con leche',
        kcal: 177, p: 8, c: 33, g: 0, min: 3, tags: ['veg', 'sintacc'],
        ing: [[200, 'ml', 'leche descremada'], [1, 'u', 'banana']],
        pasos: ['Licuá la banana con la leche bien fría.']
    },
    {
        id: 'queso-membrillo', tipo: 'colacion', nombre: 'Postre vigilante light (queso y membrillo)',
        kcal: 150, p: 8, c: 15, g: 6, min: 1, tags: ['veg', 'sintacc'],
        ing: [[40, 'g', 'queso fresco light'], [30, 'g', 'dulce de membrillo light']],
        pasos: ['Cortá el queso y el dulce en cubos y comelos juntos.']
    },
    {
        id: 'mix-frutos-secos', tipo: 'colacion', nombre: 'Puñado de frutos secos',
        kcal: 150, p: 5, c: 6, g: 13, min: 1, tags: ['veg', 'sintacc', 'sinlactosa', 'energetico'],
        ing: [[25, 'g', 'mix de frutos secos (almendras, nueces, maní)']],
        pasos: ['Medí la porción en la palma de la mano: rinden mucho pero son calóricos.']
    },
    {
        id: 'tostada-mani-banana', tipo: 'colacion', nombre: 'Tostada con maní y banana',
        kcal: 222, p: 7, c: 30, g: 9, min: 3, tags: ['veg', 'sinlactosa', 'energetico'],
        ing: [[1, 'u', 'rebanada de pan integral'], [1, 'cda', 'mantequilla de maní'], [0.5, 'u', 'banana']],
        pasos: ['Tostá el pan, untá el maní y poné la banana en rodajas.']
    },
    {
        id: 'ricota-miel', tipo: 'colacion', nombre: 'Ricota con miel y canela',
        kcal: 160, p: 11, c: 10, g: 8, min: 2, tags: ['veg', 'sintacc'],
        ing: [[100, 'g', 'ricota magra'], [1, 'cdita', 'miel'], [null, null, 'canela']],
        pasos: ['Serví la ricota con la miel y la canela por encima.']
    }
];
