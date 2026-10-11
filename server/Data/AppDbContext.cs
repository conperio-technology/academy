using Microsoft.EntityFrameworkCore;

namespace DsaAcademy.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<ProgressEntry> ProgressEntries => Set<ProgressEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ProgressEntry>()
            .HasIndex(p => new { p.UserId, p.ConceptId, p.Language })
            .IsUnique();
    }
}
