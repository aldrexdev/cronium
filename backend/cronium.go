package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Proyecto struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Nombre      string             `json:"nombre"`
	Descripcion string             `json:"descripcion"`
}

type Tarea struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Titulo      string             `json:"titulo"`
	Descripcion string             `json:"descripcion"`
	Completado  bool               `json:"completado"`
	ProyectoID  primitive.ObjectID `json:"proyectoId" bson:"proyectoId"`
}

// Salta una alerta de que no hace falta usarla, guardarla por si acaso se necesita en un futuro
// var (
//
//	client     *mongo.Client)
var collectionProyecto *mongo.Collection
var collectionTareas *mongo.Collection

func init() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error al cargar el archivo .env")
	}

	urlDbMongo := os.Getenv("MONGODB_CONEXION_BASE_DATOS_URL")

	clientOptions := options.Client().ApplyURI(urlDbMongo)

	client, err := mongo.Connect(context.TODO(), clientOptions)

	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Conectado a la base de datos")
	collectionProyecto = client.Database("cronium").Collection("proyectos2")
	collectionTareas = client.Database("cronium").Collection("tareas2")
}

func main() {

	mux := http.NewServeMux()

	rootDir := "../frontEnd/"

	fs := http.FileServer(http.Dir(rootDir))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			http.ServeFile(w, r, filepath.Join(rootDir, "croniumProyectos.html"))
			return
		}

		fs.ServeHTTP(w, r)
	})

	mux.HandleFunc("/insertProyecto", insertProyectoHandler)
	mux.HandleFunc("/searchProyectos", searchProyectosHandler)
	mux.HandleFunc("/deleteProyecto", deleteProyectoHandler)
	mux.HandleFunc("/updateProyecto", updateProyectoHandler)
	mux.HandleFunc("/insertTarea", insertTareaHandler)
	mux.HandleFunc("/searchTareas", searchTareasHandler)
	mux.HandleFunc("/deleteTarea", deleteTareaHandler)
	mux.HandleFunc("/deleteTareas", deleteTareasHandler)
	mux.HandleFunc("/updateTarea", updateTareaHandler)
	mux.HandleFunc("/countTareasNoCompletadas", countNumTareasNoCompletadas)

	handler := corsMiddleware(mux)

	fmt.Println("Servidor escuchando en puerto 8082")
	http.ListenAndServe(":8082", handler)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Establece encabezados para permitir CORS
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Si la solicitud es de tipo OPTIONS, retorna simplemente el estado 200
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Llama al siguiente middleware en la cadena
		next.ServeHTTP(w, r)
	})
}

func insertProyectoHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Método no soportado", http.StatusMethodNotAllowed)
		return
	}

	var proyecto Proyecto
	err := json.NewDecoder(r.Body).Decode(&proyecto)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)

	defer cancel()

	result, err := collectionProyecto.InsertOne(ctx, proyecto)

	if err != nil {
		http.Error(w, "Error al insertar proyecto", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func searchProyectosHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Método no soportado", http.StatusMethodNotAllowed)
		return
	}

	var proyectos []Proyecto

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)

	defer cancel()

	options := options.Find()
	options.SetSort(bson.D{{Key: "_id", Value: -1}})
	cursor, err := collectionProyecto.Find(ctx, bson.M{}, options)

	if err != nil {
		http.Error(w, "Error al buscar proyectos:"+err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var proyecto Proyecto
		err := cursor.Decode(&proyecto)

		if err != nil {
			http.Error(w, "Error al decodificar el proyecto: "+err.Error(), http.StatusInternalServerError)
			return
		}

		proyectos = append(proyectos, proyecto)
	}

	if err := cursor.Err(); err != nil {
		http.Error(w, "Error en el cursor de proyectos: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(proyectos)
}

func deleteProyectoHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "DELETE" {
		http.Error(w, "Método no soportado", http.StatusMethodNotAllowed)
		return
	}

	var idBody struct {
		ID string `json:"id"`
	}

	err := json.NewDecoder(r.Body).Decode(&idBody)
	if err != nil {
		http.Error(w, "Error al decodificar el cuerpo de la solicitud", http.StatusBadRequest)
		return
	}

	proyectoID, err := primitive.ObjectIDFromHex(idBody.ID)
	if err != nil {
		http.Error(w, "ID del proyecto inválido", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	result, err := collectionProyecto.DeleteOne(ctx, bson.M{"_id": proyectoID})

	if err != nil {
		http.Error(w, "Error al eliminar proyecto", http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "No se encontró el proyecto para borrar", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func updateProyectoHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "PUT" {
		http.Error(w, "Método no soportado", http.StatusMethodNotAllowed)
		return
	}

	var proyecto Proyecto
	err := json.NewDecoder(r.Body).Decode(&proyecto)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if proyecto.ID == primitive.NilObjectID {
		http.Error(w, "ID del proyecto requerido", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"nombre":      proyecto.Nombre,
			"descripcion": proyecto.Descripcion,
		},
	}

	result, err := collectionProyecto.UpdateByID(ctx, proyecto.ID, update)

	if err != nil {
		http.Error(w, "Error al actualizar proyecto", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)

}

func insertTareaHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Método no soportado", http.StatusMethodNotAllowed)
		return
	}

	var tarea Tarea
	err := json.NewDecoder(r.Body).Decode(&tarea)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	result, err := collectionTareas.InsertOne(ctx, tarea)

	if err != nil {
		http.Error(w, "Error al crear tarea", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)

}

func countNumTareasNoCompletadas(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Método no soportado", http.StatusMethodNotAllowed)
		return
	}

	params := make(map[string]interface{})

	err := json.NewDecoder(r.Body).Decode(&params)

	if err != nil {
		http.Error(w, "Error al decodificar el cuerpo de la solicitud", http.StatusBadRequest)
		return
	}

	proyectoIDParam, ok := params["proyectoId"].(string)

	if !ok {
		http.Error(w, "ProyectoID es requerido y debe ser un string", http.StatusBadRequest)
		return
	}

	proyectoID, err := primitive.ObjectIDFromHex(proyectoIDParam)

	if err != nil {
		http.Error(w, "ProyectoID invalido", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	count, err := collectionTareas.CountDocuments(ctx, bson.M{"proyectoId": proyectoID, "completado": false})

	if err != nil {
		http.Error(w, "Error al contar tareas", http.StatusInternalServerError)
		return
	}

	respuesta := map[string]int64{"numeroDeTareasSinCompletar": count}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(respuesta)

}

func searchTareasHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Método no soportado", http.StatusMethodNotAllowed)
		return
	}

	params := make(map[string]interface{})

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		http.Error(w, "Error al decodificar el cuerpo de la solicitud", http.StatusBadRequest)
		return
	}

	proyectoIDParam, ok := params["proyectoId"].(string)
	if !ok {
		http.Error(w, "ProyectoID es requerido y debe ser un string", http.StatusBadRequest)
		return
	}

	proyectoID, err := primitive.ObjectIDFromHex(proyectoIDParam)
	if err != nil {
		http.Error(w, "ProyectoID invalido", http.StatusBadRequest)
		return
	}

	completadoParam, ok := params["completado"].(bool)
	if !ok {
		http.Error(w, "Parámetro completado invalido", http.StatusBadRequest)
		return
	}

	paginaParam, ok := params["pagina"].(float64)
	if !ok {
		http.Error(w, "Parámetro pagina invalido", http.StatusBadRequest)
		return
	}

	pagina := int(paginaParam)
	if pagina < 1 {
		pagina = 1
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	skip := (pagina - 1) * 10
	var tareas []Tarea

	options := options.Find().SetSkip(int64(skip)).SetLimit(10)
	options.SetSort(bson.D{{Key: "_id", Value: -1}})
	cursor, err := collectionTareas.Find(ctx, bson.M{"proyectoId": proyectoID, "completado": completadoParam}, options)

	if err != nil {
		http.Error(w, "Error al listar tareas", http.StatusInternalServerError)
		return
	}

	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var tarea Tarea
		if err = cursor.Decode(&tarea); err != nil {
			http.Error(w, "Error al decodificar tarea", http.StatusInternalServerError)
			return
		}
		tareas = append(tareas, tarea)
	}

	if err = cursor.Err(); err != nil {
		http.Error(w, "Error en el cursor de tareas", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tareas)

}

func deleteTareaHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "DELETE" {
		http.Error(w, "Método no soportado", http.StatusMethodNotAllowed)
		return
	}

	var idBody struct {
		ID string `json:"id"`
	}

	err := json.NewDecoder(r.Body).Decode(&idBody)
	if err != nil {
		http.Error(w, "Error al decodificar el cuerpo de la solicitud", http.StatusBadRequest)
		return
	}

	tareaID, err := primitive.ObjectIDFromHex(idBody.ID)
	if err != nil {
		http.Error(w, "ID de la tarea inválido", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	result, err := collectionTareas.DeleteOne(ctx, bson.M{"_id": tareaID})
	if err != nil {
		http.Error(w, "Error al borrar la tarea", http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "No se encontró la tarea para borrar", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func deleteTareasHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "DELETE" {
		http.Error(w, "Método no soportado", http.StatusMethodNotAllowed)
		return
	}

	var idBody struct {
		ID string `json:"id"`
	}

	err := json.NewDecoder(r.Body).Decode(&idBody)
	if err != nil {
		http.Error(w, "Error al decodificar el cuerpo de la solicitud", http.StatusBadRequest)
		return
	}

	proyectoID, err := primitive.ObjectIDFromHex(idBody.ID)
	if err != nil {
		http.Error(w, "ID del proyecto inválido", http.StatusBadRequest)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	result, err := collectionTareas.DeleteMany(ctx, bson.M{"proyectoId": proyectoID})
	if err != nil {
		http.Error(w, "Error al borrar las tareas", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func updateTareaHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "PUT" {
		http.Error(w, "Método no soportado", http.StatusMethodNotAllowed)
		return
	}

	var tarea Tarea
	err := json.NewDecoder(r.Body).Decode(&tarea)
	if err != nil {
		http.Error(w, "Error al decodificar el cuerpo de la solicitud", http.StatusBadRequest)
		return
	}

	if tarea.ID == primitive.NilObjectID {
		http.Error(w, "ID de la tarea requerido", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"titulo":      tarea.Titulo,
			"descripcion": tarea.Descripcion,
			"completado":  tarea.Completado,
		},
	}

	result, err := collectionTareas.UpdateByID(ctx, tarea.ID, update)
	if err != nil {
		http.Error(w, "Error al actualizar la tarea", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
