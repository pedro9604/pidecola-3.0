<!-- Título -->
# Manual de Back-end

<!--
  Autor | Contacto | Fecha | Versión
-->
|    Escrito por    |      Email      |    Fecha    |   Versión del Manual  |
| ----------------- | --------------- | ----------- | --------------------- |
| Francisco Márquez | 12-11163@usb.ve | Julio  2020 |      Versión 1.3      |

<!-- ¿Qué es? -->
Este manual es una guía para añadir añadir nuevos controladores para la
aplicación PideCola 3.0. Para saber cómo hacer modificaciones sobre los
modelos y esquemas de la base de datos revisar el Manual de Base de Datos de
la aplicación.

<!-- ¿Para qué existe? -->
Este manual fue diseñado para facilitarle a los nuevos desarrolladores de la
aplicación Pide Cola 3.0 cómo y dónde generar el código para las nuevas
funcionalidades que deseen que la misma soporte.

<!-- ¿Cuáles son sus partes? -->
Este manual se compone de las siguientes secciones:

 * [Agregar un nuevo controlador `xController.js`](#agregar-un-nuevo-controlador-xcontrollerjs)
 * [Diseño de la aplicación](#diseño-de-la-aplicación)
 * [Estado actual](#estado-actual)
 * [Posibles cambios](#posibles-cambios)
 * [Cómo ejecutar los cambios](#cómo-hacer-los-cambios)
 * [Recomendaciones generales](#recomendaciones-generales)

## Agregar un nuevo controlador `xController.js`

**¿Qué es un controlador?**

Un controlador es una función que responde a eventos (usualmente acciones del
usuario) e invoca peticiones a la base de datos cuando se hace alguna
solicitud sobre la información fuente: [Wikipedia](https://es.wikipedia.org/wiki/Modelo–vista–controlador)

1. Genere el archivo `xController.js` en el directorio `/controllers`, donde
`x` es un nombre descriptivo de su controlador. Por ejemplo: 
`userController.js` es el controlador de todas aquellas funciones relacionadas
con los usuarios de la aplicación.

2. Dentro de su archivo importe, usando la función `require` aquellos módulos
que le sean de utilidad, cuidando importar solo aquellas clases, métodos y
funciones que sean indispensables para el desarrollo de su controlador. Si
requiere funciones para acceder a la base de datos, consulte el manual de
la base de datos, asimismo, es muy probable que las funciones que usted
requiere ya hayan sido implementadas en otro controlador y sean
importables usando `require`.

3. En caso de que no haya ninguna función que haga lo que requiere, escríbala
y **documéntela** dentro del código fuente de su controlador utilizando el
**formato de jsdoc**. Incluya dentro de su documentación la forma de hacer
modificaciones sobre su código.

No exporte funciones que accedan directamente a base de datos o a variables
globales de la aplicación a no ser que sea estrictamente necesario. Exporte
solo funciones que manejen el acceso a elementos privados de la aplicación
con un uso específico. Por ejemplo: no exporte un modelo ni un esquema de
la base de datos a múltiples controladores para usar los métodos de la API
`Mongoose` de JavaScript, en su lugar, escriba una función que haga uso de
tales métodos y exporte esa función.

Por cada controlador, si desea generar un archivo de pruebas, genérelo en
el directorio `/__test__`

### Agregar un nuevo endpoint

**¿Qué es un endpoint?**

En este contexto es una función que sirve de extremo en la conexión Back-End/
Front-End. Fuente: [Wikipedia](https://en.wikipedia.org/wiki/Endpoint)

Cada controlador es un conjunto de endpoints, y funciones auxiliares del
endpoint y cada endpoint tiene la finalidad de satisfacer una petición
específica del Front-End así, cree el endpoint `endpoint` de la siguiente
manera:

1. Declare el endpoint como una función, **no edite ninguna función ya escrita**:
```Javascript
function endpoint (req, res) {
  // Cuerpo de la funcion
}
```

2. Para **hacer visible su endpoint a la aplicación**, en el final del archivo incluya:
```JavaScript
module.exports.endpoint = endpoint
```

3. En el archivo `routes.js` de su controlador (si su controlador es
`xController.js`, este archivo debería llamarse `xRoutes.js` y estar en
el directorio `/routes`), agregue el nuevo endpoint según las indicaciones en
la [sección correspondiente](#agregar-el-archivo-a-routes)). Esto establece una
**ruta de acceso** a su endpoint.

4. Todo endpoint se recomienda mantenga la siguiente estructura:

  1. Verificar la integridad de los datos en la solicitud (`req`). Apoyese en
  funciones auxiliares para ello. **No asegure nada sobre la entrada**

  2. Retornar mensajes de error descriptivos de los que ha ocurrido. Se
  recomienda revisar el archivo `lib/utils/validation.js`. En este archivo se
  encuentran numerosas variables que contienen los campos a verificar y los
  mensajes de error a devolver.

  3. Retornar la información requerida por el Front-End en caso de pasar las
  verificaciones en la respuesta `res`.

Se recomienda adicionalmente, para la legibilidad del controlador inciar sus
endpoints con el siguiente formato:

```Javascript
///////////////////////////////////////////////////////////////////////////////
//////////////////// Endpoint Nombre-y-Descripcion-Endpoint ///////////////////
///////////////////////////////////////////////////////////////////////////////

function endpoint (req, res) {...}
```

**No olvide documentar sus endpoints con el formato de jsdoc**

### Agregar un archivo de pruebas para el controlador `xController.js`

1. Genere el archivo `xController.test.js` en el directorio `/__test__`, donde
`x` es el nombre descriptivo de su controlador. Por ejemplo:
`userController.js` tiene asociado su archivo de pruebas en el archivo
`userController.test.js`

2. Dentro de su archivo importe los controladores necesarios de la siguiente
forma:

```JavaScript
const x = require('../controllers/xController.js')
```

Por ejemplo, en `rideController.test.js`

```JavaScript
const user = require('../controllers/userController.js')
const ride = require('../controllers/rideController.js')
```

Puede importar cualquier otro módulo que requiera, incluso modelos de la base de datos si es imperativo, en tal caso, no hay convención sobre el nombre a dar a la constante, en el mismo `rideController.test.js` se encuentra

```JavaScript
const usr = require('../models/userModel.js')
const httpMocks = require('node-mocks-http')
```

Este último módulo es utilizado para simular las llamadas y respuestas HTTP dentro de la app.

3. Para cada función que desee probar, genere su suite de pruebas de la
siguiente forma:

```JavaScript
describe("function to prove", () => {
  beforeEach(() => {
    //code
  })
  afterEach(() => {
    //code
  })
  test("This is the first test", () => {
    //code
  })
  ...
  test("This is the last test", () => {
    //code
  })
})
```

Las funciones `beforeEach()` y `afterEach()` son opcionales cuando requiera
generar por cada prueba un estado en la aplicación para que su prueba pueda
ejecutarse exitosamente.

El motor de pruebas de la app es `JEST`. Es recomendable leer la
documentación de `JEST` si se desea mejorar el desempeño de las pruebas.

Para ejecutar las pruebas basta con ejecutar vía interfaz de línea de
comandos (CLI): `npm run test`

### Para conectar un nuevo controlador con el resto de la aplicación
Para que su controlador sea accesible desde el Front-end, se debe agregar
una nueva ruta para su controlador en el directorio `/routes` y ese archivo
será usado por `index.js` aplicación.

#### Agregar el archivo a `/routes`

1. Para el controlador `xController.js` genere el archivo `xRoutes.js` en el
  directorio `/routes`, donde `x` es el nombre descriptivo de su controlador.

2. Para el controlador `xController.js` haga:

```JavaScript
const express = require('express')
const router = express.Router()
const xController = require('../controllers/xController.js')
```

Dependiendo de la naturaleza de sus funciones, pueden corresponder con
distintos métodos HTTP (PUT, GET, POST, ...)

3. Para el método HTTP `Y` (`y` en minúsculas) genere el comentario `// Ys` y
haga:

```JavaScript
router.y('/func', xController.func)
```

Donde `func` respresenta el nombre de la función que exporta su controlador.

4. Finalmente exporte la variable router usando:

```JavaScript
module.exports = router
```

Ejemplo, el controlador `userController.js` exporta tres funciones, dos
POST y un PUT, entonces, en el archivo `userRoutes.js` está:

```JavaScript
const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')

// POSTs
router.post('/', userController.create)
router.post('/code', userController.codeValidate)

//PUTs
router.put('/addVehicle', userController.addVehicle)

module.exports = router
```
#### Hacer visible la nueva ruta en `index.js`
Agregada la ruta, esta debe poder ser visible debe ser visible en `index.js`
entonces:

1. Para el archivo `xRoutes.js`, dentro de `index.js` hacer:

```JavaScript
const x = require('./routes/xRoutes.js')
app.use('/x', x)
```

Para verificar que todo ha sido añadido sin errores léxico-sintácticos
ejecute en CLI npm run start, debe aparecer:

```
   _______  ___  ______  ______ 
  |   __  ||   ||      ||   ___|
  |  |  | ||   ||  __  ||  |
  |  |__| ||   || |  | ||  |___ 
  |   ____||   || |  | ||   ___|
  |  |     |   || |__| ||  | 
  |  |     |   ||      ||  |___ 
  |__|     |___||______||______|

 _______  _______  _      _______  _______       ______ 
|   ____||       || |    |       ||___    |     |      |
|  |     |   _   || |    |   _   |    |   |     |  __  |
|  |     |  | |  || |    |  | |  | ___|   |     | |  | |
|  |     |  | |  || |    |  |_|  ||___    |     | |  | |
|  |     |  |_|  || |    |       |    |   | ___ | |__| |
|  |____ |       || |___ |   _   | ___|   ||   ||      |
|_______||_______||_____||__| |__||_______||___||______|

```
Si esto es así, todo ha sido exitoso y ya puede utilizar su nuevo
controlador.

## Diseño de la aplicación

La aplicación se diseñó de la siguiente manera:

* Si una persona es miembro de la comunidad universitaria (Universidad Simón Bolívar) se registra en la aplicación.

* Una vez registrada, inicia sesión en la aplicación.

    * En su primer inicio de sesión se le exige al usuario completar su
    registro, completando campos básicos de identificación, tales como: nombre,
    apellido, carrera, etc.

* Al ingresar a la aplicación el usuario puede siempre dos cosas:

    * Manipular su perfil.
  
        * El usuario puede revisar solamente su perfil.

        * El usuario puede modificar datos personales no susceptibles de ser
        cambiados en la realidad, _i. e._, no puede modificar su usbid, su
        nombre o apellido.

        * El usuario puede gestionar sus vehículos. Si no tiene vehículos
        registrados no puede ofrecer colas dentro de la aplicación.

    * Gestionar sus colas.

        * Si el usuario no tiene una solicitud cola activa entonces:

            * Puede solicitar la cola cuando lo desee.

            * Si el usuario tiene al menos un (1) vehículo registrado, puede
              ofrecer la cola a otros usuarios.

        * El usuario puede cancelar una solicitud de cola, esto eliminará la
        solicitud del sistema y permitirá crear una nueva solicitud de cola.

        * Una vez que el solicitante se le muestra su solicitud a los posibles
        oferentes de acuerdo a los criterios del algoritmo de recomendación.

        * Cuando un oferente selecciona a un posible pasajero, se le notifica
        al solicitante.

        * El solicitante, al ser notificado, ingresa a la aplicación y
        responde a la oferta de cola. Se le notifica al oferente.

        * El oferente, al ser notificado, puede:

            * Ponerse en contacto con el pasajero, para coordinar los detalles.

            * Seleccionar a otro solicitante, si así lo desea.

        * Una cola ya concretada puede ser cancelada en cualquier momento. Una
        cola cancelada no se considera finalizada.

        * Los usuarios involucrados en la cola podrán conseguir marcar como
        finalizada la cola para poder realizar comentarios sobre la cola.

        * Los comentarios de la cola involucran un like, o un dislike, y un
        comentario descriptivo de la cola.

## Estado actual

Para el momento del desarrollo de este manual, se encuentran soportadas todas
las funciones descritas en el diseño. A continuación se presentará una breve
descripción del funcionamiento del Back-End, por módulos.

Se considerarán solamente los controladores y _endpoints_ de la aplicación. La
información oncerniente a la base de datos se presenta en el Manual de Base
de Datos de la aplicación.

Para más información consulte la información la documentación generada por
`jsdoc` en el directorio `/out`

### Controlador de usuarios: userController

Desarrollado por:

|     Nombre      |      Email      |
| --------------- | --------------- |
| Pedro Maldonado | 13-10790@usb.ve |
|  Ángel Morante  | 13-10931@usb.ve |

Contiene los endpoints y funciones que manejan la información de los
usuarios.

Los endpoints que contiene son:

* Crear un usuario
* Actualizar información de usuario
* Actualizar foto de perfil
* Agregar vehículo
* Eliminar vehículo
* Validar código de confirmación
* Ver perfil del usuario

Para más información consulte la documentación del módulo userController.

### Controlador de colas: rideController

Desarrollado por:

|      Nombre       |      Email      |
| ----------------- | --------------- |
| Francisco Márquez | 12-11163@usb.ve |

Contiene los endpoints y funciones que manejan la información de las colas.

Los endpoints que contiene son:

* Crear una cola
* Marcar como finalizada una cola
* Cambiar estado de una cola
* Comentar una cola

Para más información consulte la documentación del módulo rideController.

### Controlador de solicitudes de colas: requestsController

Desarrollado por:

|      Nombre       |      Email      |
| ----------------- | --------------- |
| Francisco Márquez | 12-11163@usb.ve |

Contiene los endpoints y funciones que manejan la recomendación de
solicitudes de colas.

Los endpoints que contiene son:

* Solicitar una cola
* Cancelar una solicitud de cola
* Cambiar el estado de una solicitud de cola
* Ofrecer una cola
* Responder a una oferta de cola

Las solicitudes de cola, para el momento de la elaboración de este manual,
versión 1.2 no son persistentes, _i. e._, se eliminan permanentemente luego de
que o son atendidas o son canceladas. Se mantienen activas incluso ante fallas
del servidor porque se almacenan en Redis. Si se desea, en cambio que las
solicitudes sean persistentes para su posterior consulta, dependiendo del medio
que se elija para almacenarlas, deben [agregarse endpoints](#agregar-un-nuevo-endpoint) para gestionarlas desde donde se hayan almacenado.
Si se desea almacenar en la base de datos, **consulte el manual del
administrador de la base de datos**.

Asimismo, las solicitudes de cola se ordenan como una cola (primero en entrar
a la lista, primero en mostrarse). Si se desea cambiar este orden deben
agregarse **funciones** que manejen la inserción ordenada de las solicitudes a
la lista. Si se desean agregar campos a las solicitudes de cola para que haya
algún tipo de discriminación adicional (no recomendado), debe revisarse
exhaustivamente la aplicación de forma tal que no haya algún error escondido
en un flujo alternativo.

Para más información consulte la documentación del módulo requestsController.

### Controlador del algoritmo de recomendación: algorithmController

Desarrollado por:

|      Nombre       |      Email      |
| ----------------- | --------------- |
| Francisco Márquez | 12-11163@usb.ve |

Contiene los endpoints y funciones que manejan la información de las colas.

El endpoint que contiene es: recomendar solicitudes de cola.

Para más información consulte la documentación del módulo algorithmController.

## Posibles cambios

La aplicación para el momento del desarrollo de este manual es una versión
minimal de lo que se pretende, _i. e._, la aplicación pretende ser una
alternativa para los miembros de la comunidad universitaria que utilizan los
autobuses.

La aplicación debería conectar al menos todas las rutas urbanas e interurbanas
que cubren los autobuses de la Universidad Simón Bolívar. No obstante, para el
momento de desarrollo de este manual, la aplicación solo contempla las cinco
paradas urbanas de la sede Sartenejas, a saber, por orden creciente de
separación de la universidad:

* Baruta
* Coche
* Chacaito
* La Paz
* Bellas Artes

En un futuro se desea que la aplicación cubra adicionalmente, sin orden
particular:

* Turgua
* Los Teques
* San Antonio
* Maracay
* La Victoria
* La Encrucijada
* Guarenas
* Guatire
* Charallave
* Cúa
* La Guaira
* Plaza El Cónsul
* Intersedes
* Catia La Mar
* Camurí Chico

Y cualquier otra parada que contemple la Federación de Centros de Estudiantes
de la Universidad Simón Bolívar (FCEUSB).

En tal sentido, se tendrán que añadir todas las paradas adicionales al
controlador de solicitudes (`requestsController.js`) y al controlador del
algoritmo (`algorithmController.js`), según las recomendaciones presentadas en
ambos y resumidas aquí:

- Utilizar manualmente Google Maps para calcular las distancias entre paradas
y entre paradas y la Universidad, teniendo cuidado de no permitir que Google Maps seleccione la ruta, esto puede llevar a inconsistencias catastróficas.

- Las distancias entre paradas se mantienen en `algorithmController.js`. Para
agregar las distancias, mantener el orden de distancias.

- Las paradas se manejan en `requestsController.js`. Para agregar paradas,
hacerlo de forma ordenada respecto a la distancia de la parada a la
Universidad.

## ¿Cómo hacer los cambios?

Para cambiar algún controlador se dejan indicaciones en la documentación de
cada uno. Para añadir nuevos controladores revisar la [sección correspondiente](#agregar-un-nuevo-controlador-xcontrollerjs) de este manual.

## Recomendaciones generales

* Evitar trabajar con promesas de Javascript
* Evitar asignar funciones anónimas a variables, es preferible escribir una
función tradicional, ejemplo:

```Javascript
//Buen uso de una función tradicional
function recta(x) {
  return 2 * x + 1
}

// Si x es una Promesa, buen uso de una función anónima.
x.then((sucess, error) => {
  if (!error) {
    return sucess
  } else {
    console.log('Ha ocurrido un error': error)
    return error
  }
})

// Mal uso de funciones anónimas
const parabola = (x) => {
  return x * x
}
```

* Recuerde que las funciones anónimas son funciones cuyo uso es tan infrecuente
que no vale la pena definir una función tradicional para ellas. Un buen
criterio para saber si una función debe ser anónima o no, es pensar cuántas
veces será usada. En el ejemplo previo, si esa será la manera estándar de
manejar sus promesas, entonces es correcto y se espera que usted defina una
función tradicional _callback_ que invoque siempre que tenga que manejar una
promesa.

* Se recomienda copiar el estilo de comentarios y documentación de los controladores de solicitudes, algoritmo y colas.

* Para cada controlador escriba primero un _endpoint_ y sucesivamente escriba
aquellas funciones que llama en el cuerpo del _endpoint_ por orden de
aparición.

* Agrupe las funciones con los _endpoints_ que las utilizan. Si existe alguna
función que es utilizada por más de un _endpoint_, manténgala agrupada con el
primer _endpoint_ que la usó.

* Tenga cuidado cuando defina parámetros por defecto. Esto puede ocasionarle
errores difíciles de detectar y en consecuencia, corregir.
