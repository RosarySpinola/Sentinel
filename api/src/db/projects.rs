//! Project database operations

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use super::DbPool;

/// Project model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Project {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub network: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Project with counts
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectWithCounts {
    #[serde(flatten)]
    pub project: Project,
    pub simulation_count: i64,
    pub prover_run_count: i64,
}

/// Create project input
#[derive(Debug, Deserialize)]
pub struct CreateProject {
    pub name: String,
    pub description: Option<String>,
    pub network: Option<String>,
}

/// Update project input
#[derive(Debug, Deserialize)]
pub struct UpdateProject {
    pub name: Option<String>,
    pub description: Option<String>,
    pub network: Option<String>,
}

/// Create a new project
pub async fn create_project(pool: &DbPool, user_id: Uuid, input: CreateProject) -> Result<Project, sqlx::Error> {
    sqlx::query_as::<_, Project>(
        r#"
        INSERT INTO projects (user_id, name, description, network)
        VALUES ($1, $2, $3, COALESCE($4, 'testnet'))
        RETURNING *
        "#,
    )
    .bind(user_id)
    .bind(&input.name)
    .bind(&input.description)
    .bind(&input.network)
    .fetch_one(pool)
    .await
}

/// Get project by ID
pub async fn get_project_by_id(pool: &DbPool, id: Uuid) -> Result<Option<Project>, sqlx::Error> {
    sqlx::query_as::<_, Project>("SELECT * FROM projects WHERE id = $1")
        .bind(id)
        .fetch_optional(pool)
        .await
}

/// List projects for a user
pub async fn list_projects(pool: &DbPool, user_id: Uuid) -> Result<Vec<Project>, sqlx::Error> {
    sqlx::query_as::<_, Project>(
        "SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
}

/// List projects with counts
pub async fn list_projects_with_counts(pool: &DbPool, user_id: Uuid) -> Result<Vec<ProjectWithCounts>, sqlx::Error> {
    let projects = list_projects(pool, user_id).await?;
    let mut result = Vec::with_capacity(projects.len());

    for project in projects {
        let sim_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM simulations WHERE project_id = $1"
        )
        .bind(project.id)
        .fetch_one(pool)
        .await?;

        let prover_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM prover_runs WHERE project_id = $1"
        )
        .bind(project.id)
        .fetch_one(pool)
        .await?;

        result.push(ProjectWithCounts {
            project,
            simulation_count: sim_count.0,
            prover_run_count: prover_count.0,
        });
    }

    Ok(result)
}

/// Update project
pub async fn update_project(pool: &DbPool, id: Uuid, user_id: Uuid, input: UpdateProject) -> Result<Option<Project>, sqlx::Error> {
    sqlx::query_as::<_, Project>(
        r#"
        UPDATE projects
        SET name = COALESCE($3, name),
            description = COALESCE($4, description),
            network = COALESCE($5, network)
        WHERE id = $1 AND user_id = $2
        RETURNING *
        "#,
    )
    .bind(id)
    .bind(user_id)
    .bind(&input.name)
    .bind(&input.description)
    .bind(&input.network)
    .fetch_optional(pool)
    .await
}

/// Delete project
pub async fn delete_project(pool: &DbPool, id: Uuid, user_id: Uuid) -> Result<bool, sqlx::Error> {
    let result = sqlx::query("DELETE FROM projects WHERE id = $1 AND user_id = $2")
        .bind(id)
        .bind(user_id)
        .execute(pool)
        .await?;
    Ok(result.rows_affected() > 0)
}
