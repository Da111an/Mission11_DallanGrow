using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class BookstoreContext(DbContextOptions<BookstoreContext> options) : DbContext(options)
{
    public DbSet<Book> Books => Set<Book>();
}
