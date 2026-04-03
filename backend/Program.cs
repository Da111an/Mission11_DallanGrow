using backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddDbContext<BookstoreContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("BookstoreConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");

app.MapGet("/api/books", async (
    BookstoreContext db,
    int page = 1,
    int pageSize = 5,
    string sort = "asc",
    string[]? category = null) =>
{
    page = Math.Max(1, page);
    pageSize = Math.Clamp(pageSize, 1, 100);
    var sortDesc = string.Equals(sort, "desc", StringComparison.OrdinalIgnoreCase);

    IQueryable<backend.Models.Book> query = db.Books.AsNoTracking();

    if (category is { Length: > 0 })
    {
        var selectedCategories = category
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Distinct()
            .ToArray();

        if (selectedCategories.Length > 0)
        {
            query = query.Where(b => selectedCategories.Contains(b.Category));
        }
    }

    query = sortDesc ? query.OrderByDescending(b => b.Title) : query.OrderBy(b => b.Title);

    var totalItems = await query.CountAsync();
    var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
    if (totalPages > 0)
    {
        page = Math.Min(page, totalPages);
    }

    var books = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    return Results.Ok(new
    {
        books,
        pagination = new
        {
            page,
            pageSize,
            totalItems,
            totalPages
        }
    });
})
.WithName("GetBooks");

app.MapGet("/api/books/categories", async (BookstoreContext db) =>
{
    var categories = await db.Books.AsNoTracking()
        .Select(b => b.Category)
        .Distinct()
        .OrderBy(c => c)
        .ToListAsync();

    return Results.Ok(categories);
})
.WithName("GetBookCategories");

app.MapGet("/api/books/{id:int}", async (BookstoreContext db, int id) =>
{
    var book = await db.Books.FindAsync(id);
    return book is not null ? Results.Ok(book) : Results.NotFound();
})
.WithName("GetBookById");

app.MapPost("/api/books", async (BookstoreContext db, backend.Models.Book book) =>
{
    db.Books.Add(book);
    await db.SaveChangesAsync();
    return Results.Created($"/api/books/{book.BookId}", book);
})
.WithName("CreateBook");

app.MapPut("/api/books/{id:int}", async (BookstoreContext db, int id, backend.Models.Book updated) =>
{
    var book = await db.Books.FindAsync(id);
    if (book is null) return Results.NotFound();

    book.Title = updated.Title;
    book.Author = updated.Author;
    book.Publisher = updated.Publisher;
    book.Isbn = updated.Isbn;
    book.Classification = updated.Classification;
    book.Category = updated.Category;
    book.PageCount = updated.PageCount;
    book.Price = updated.Price;

    await db.SaveChangesAsync();
    return Results.Ok(book);
})
.WithName("UpdateBook");

app.MapDelete("/api/books/{id:int}", async (BookstoreContext db, int id) =>
{
    var book = await db.Books.FindAsync(id);
    if (book is null) return Results.NotFound();

    db.Books.Remove(book);
    await db.SaveChangesAsync();
    return Results.NoContent();
})
.WithName("DeleteBook");

app.Run();
