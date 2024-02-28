package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type GinRouter struct {
	router *gin.Engine
}

func NewRouter() *GinRouter {
	router := gin.Default()
	// TODO: turst proxiesを設定
	return &GinRouter{router: router}
}

func (r *GinRouter) Listen() {
	r.router.GET("/greet", greet)
	r.router.GET("/coding", coding)

	r.router.Run()
}

func greet(context *gin.Context) {
	context.JSON(http.StatusOK, gin.H{
		"message": "Hello, World!",
	})
}

func coding(context *gin.Context) {

}
