package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	port := "8080"

	// Serve static files from current directory
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", fs)

	fmt.Printf("Serving at http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
