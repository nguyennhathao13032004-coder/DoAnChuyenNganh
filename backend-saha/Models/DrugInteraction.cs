using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_saha.Models
{
    [Table("drug_interactions")]
    public class DrugInteraction
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("product_a_id")]
        public Guid ProductAId { get; set; }

        [Column("product_b_id")]
        public Guid ProductBId { get; set; }

        [Column("severity_level")]
        public string SeverityLevel { get; set; }

        [Column("warning_description")]
        public string WarningDescription { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}