package main
import "fmt"
func main() {
    a := [2][2]int{{1, 2}, {3, 4}}
    b := [2][2]int{{5, 6}, {7, 8}}
    var c [2][2]int
    for i := 0; i < 2; i++ {
        for j := 0; j < 2; j++ {
            c[i][j] = 0
            for k := 0; k < 2; k++ {
                c[i][j] += a[i][k] * b[k][j]
            }
        }
    }
    for i := 0; i < 2; i++ {
        for j := 0; j < 2; j++ {
            fmt.Printf("%d ", c[i][j])
        }
        fmt.Println()
    }
}
