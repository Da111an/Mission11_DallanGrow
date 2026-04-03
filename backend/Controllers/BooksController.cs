using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BooksController(BookstoreContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetBooks(
        int page = 1,
        int pageSize = 5,
        string sort = "asc",
        [FromQuery] string[]? category = null)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var sortDesc = string.Equals(sort, "desc", StringComparison.OrdinalIgnoreCase);

        IQueryable<Book> query = db.Books.AsNoTracking();

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

        return Ok(new
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
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await db.Books.AsNoTracking()
            .Select(b => b.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBookById(int id)
    {
        var book = await db.Books.FindAsync(id);
        return book is not null ? Ok(book) : NotFound();
    }

    [HttpPost]
    public async Task<IActionResult> CreateBook(Book book)
    {
        db.Books.Add(book);
        await db.SaveChangesAsync();
        return Created($"/api/books/{book.BookId}", book);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateBook(int id, Book updated)
    {
        var book = await db.Books.FindAsync(id);
        if (book is null) return NotFound();

        book.Title = updated.Title;
        book.Author = updated.Author;
        book.Publisher = updated.Publisher;
        book.Isbn = updated.Isbn;
        book.Classification = updated.Classification;
        book.Category = updated.Category;
        book.PageCount = updated.PageCount;
        book.Price = updated.Price;

        await db.SaveChangesAsync();
        return Ok(book);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await db.Books.FindAsync(id);
        if (book is null) return NotFound();

        db.Books.Remove(book);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
