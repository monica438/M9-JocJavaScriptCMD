import readline from "readline";
import fs from "fs";

const FILAS = ["A", "B", "C", "D", "E", "F"];
const COLUMNAS = 8;
const TOTAL_TESOROS = 16;
const TIRADAS_INICIALES = 32;

class Casilla {
  constructor() {
    this.tieneTesoro = false;
    this.destapada = false;
  }
}

class Juego {
  constructor() {
    this.tablero = [];
    this.tiradas = TIRADAS_INICIALES;
    this.tesorosEncontrados = 0;
    this.trampa = false;
    this.crearTablero();
    this.colocarTesoros();
  }

  crearTablero() {
    this.tablero = [];

    for (let fila = 0; fila < FILAS.length; fila++) {
      const nuevaFila = [];

      for (let col = 0; col < COLUMNAS; col++) {
        nuevaFila.push(new Casilla());
      }

      this.tablero.push(nuevaFila);
    }
  }

  colocarTesoros() {
    let colocados = 0;

    while (colocados < TOTAL_TESOROS) {
      const fila = Math.floor(Math.random() * FILAS.length);
      const col = Math.floor(Math.random() * COLUMNAS);

      if (!this.tablero[fila][col].tieneTesoro) {
        this.tablero[fila][col].tieneTesoro = true;
        colocados++;
      }
    }
  }

  mostrarTablero() {
    console.log();
    let cabecera = "  01234567";

    if (this.trampa) {
      cabecera += "     01234567";
    }

    console.log(cabecera);

    for (let fila = 0; fila < FILAS.length; fila++) {
      let linea = FILAS[fila];

      for (let col = 0; col < COLUMNAS; col++) {
        const casilla = this.tablero[fila][col];

        if (!casilla.destapada) {
          linea += "·";
        } else if (casilla.tieneTesoro) {
          linea += "T";
        } else {
          linea += "X";
        }
      }

      if (this.trampa) {
        linea += "   " + FILAS[fila];

        for (let col = 0; col < COLUMNAS; col++) {
          const casilla = this.tablero[fila][col];

          if (casilla.tieneTesoro) {
            linea += "T";
          } else {
            linea += "·";
          }
        }
      }

      console.log(linea);
    }

    console.log();
  }

  convertirCoordenada(texto) {
    texto = texto.toUpperCase().trim();

    const filaLetra = texto[0];
    const columnaTexto = texto.slice(1);

    const fila = FILAS.indexOf(filaLetra);
    const col = Number(columnaTexto);

    if (
      fila === -1 ||
      Number.isNaN(col) ||
      col < 0 ||
      col >= COLUMNAS
    ) {
      return null;
    }

    return { fila, col };
  }

  destapar(coordenadaTexto) {
    const coordenada = this.convertirCoordenada(coordenadaTexto);

    if (coordenada === null) {
      console.log("Coordenada incorrecta. Ejemplo válido: B3");
      return;
    }

    const { fila, col } = coordenada;
    const casilla = this.tablero[fila][col];

    if (casilla.destapada) {
      console.log("Esta casilla ya está destapada.");
      return;
    }

    casilla.destapada = true;

    if (casilla.tieneTesoro) {
      this.tesorosEncontrados++;
      console.log("Has encontrado un tesoro!");
    } else {
      this.tiradas--;
      const distancia = this.distanciaTesoroMasCercano(fila, col);
      console.log(`No hay tesoro. El tesoro más cercano está a distancia ${distancia}.`);
    }

    this.comprobarFinal();
  }

  distanciaTesoroMasCercano(filaActual, colActual) {
    let distanciaMinima = Infinity;

    for (let fila = 0; fila < FILAS.length; fila++) {
      for (let col = 0; col < COLUMNAS; col++) {
        const casilla = this.tablero[fila][col];

        if (casilla.tieneTesoro && !casilla.destapada) {
          const distancia =
            Math.abs(fila - filaActual) + Math.abs(col - colActual);

          if (distancia < distanciaMinima) {
            distanciaMinima = distancia;
          }
        }
      }
    }

    return distanciaMinima;
  }

  mostrarPuntuacion() {
    console.log(`Puntuación: ${this.tesorosEncontrados}/${TOTAL_TESOROS}`);
    console.log(`Tiradas restantes: ${this.tiradas}`);
  }

  activarTrampa() {
    this.trampa = true;
    console.log("Trampa activada.");
  }

  desactivarTrampa() {
    this.trampa = false;
    console.log("Trampa desactivada.");
  }

  guardarPartida(nombreArchivo) {
    const datos = {
      tablero: this.tablero,
      tiradas: this.tiradas,
      tesorosEncontrados: this.tesorosEncontrados,
      trampa: this.trampa
    };

    fs.writeFileSync(nombreArchivo, JSON.stringify(datos, null, 2));
    console.log(`Partida guardada en ${nombreArchivo}`);
  }

  cargarPartida(nombreArchivo) {
    if (!fs.existsSync(nombreArchivo)) {
      console.log("El archivo no existe.");
      return;
    }

    const contenido = fs.readFileSync(nombreArchivo, "utf-8");
    const datos = JSON.parse(contenido);

    this.tablero = datos.tablero;
    this.tiradas = datos.tiradas;
    this.tesorosEncontrados = datos.tesorosEncontrados;
    this.trampa = datos.trampa;

    console.log(`Partida cargada desde ${nombreArchivo}`);
  }

  comprobarFinal() {
    if (this.tesorosEncontrados === TOTAL_TESOROS) {
      console.log(`Has guanyat amb només ${TIRADAS_INICIALES - this.tiradas} tirades`);
      process.exit();
    }

    if (this.tiradas <= 0) {
      const restantes = TOTAL_TESOROS - this.tesorosEncontrados;
      console.log(`Has perdut, queden ${restantes} tresors`);
      process.exit();
    }
  }
}

function mostrarAyuda() {
  console.log(`
Comandes disponibles:

ajuda / help
  Mostra aquesta ajuda.

destapar B3
  Destapa una casella. Exemple: destapar B3

puntuació
  Mostra la puntuació i les tirades restants.

activar trampa
  Mostra el tauler amb els tresors.

desactivar trampa
  Amaga el tauler amb els tresors.

guardar partida nom.json
  Guarda la partida actual.

carregar partida nom.json
  Carrega una partida guardada.

sortir
  Acaba el joc.
`);
}

let juego = new Juego();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function preguntar() {
  juego.mostrarTablero();

  rl.question("Escriu una comanda: ", comando => {
    procesarComando(comando.trim());
    preguntar();
  });
}

function procesarComando(comando) {
  const partes = comando.split(" ");
  const accion = partes[0]?.toLowerCase();

  if (accion === "ajuda" || accion === "help") {
    mostrarAyuda();
    return;
  }

  if (accion === "destapar") {
    juego.destapar(partes[1]);
    return;
  }

  if (accion === "puntuació" || accion === "puntuacion") {
    juego.mostrarPuntuacion();
    return;
  }

  if (comando === "activar trampa") {
    juego.activarTrampa();
    return;
  }

  if (comando === "desactivar trampa") {
    juego.desactivarTrampa();
    return;
  }

  if (partes[0] === "guardar" && partes[1] === "partida") {
    juego.guardarPartida(partes[2]);
    return;
  }

  if (partes[0] === "carregar" && partes[1] === "partida") {
    juego.cargarPartida(partes[2]);
    return;
  }

  if (accion === "sortir" || accion === "salir") {
    console.log("Adeu!");
    process.exit();
  }

  console.log("Comanda desconeguda. Escriu ajuda.");
}

console.log("Busca tresors");
mostrarAyuda();
preguntar();