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

app.Run();
