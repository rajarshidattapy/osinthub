"""Change users.id to String UUID

Revision ID: b49e0efeef7d
Revises: 
Create Date: 2025-09-14 12:09:27.773991

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b49e0efeef7d'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table first
    op.create_table('users',
        sa.Column('id', sa.String(), primary_key=True, nullable=False),
        sa.Column('clerk_id', sa.String(), unique=True, nullable=False),
        sa.Column('username', sa.String(), unique=True, nullable=False),
        sa.Column('email', sa.String(), unique=True, nullable=False),
        sa.Column('avatar', sa.String(), nullable=True),
        sa.Column('role', sa.String(), default="contributor", nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_table('repositories',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('owner_id', sa.String(), nullable=False),
    sa.Column('is_private', sa.Boolean(), nullable=True),
    sa.Column('fork_count', sa.Integer(), nullable=True),
    sa.Column('forked_from_id', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['forked_from_id'], ['repositories.id'], ),
    sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('audit_entries',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('action', sa.String(), nullable=False),
    sa.Column('user_id', sa.String(), nullable=False),
    sa.Column('repository_id', sa.String(), nullable=True),
    sa.Column('details', sa.JSON(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['repository_id'], ['repositories.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('merge_requests',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('author_id', sa.String(), nullable=False),
    sa.Column('source_repo_id', sa.String(), nullable=False),
    sa.Column('target_repo_id', sa.String(), nullable=False),
    sa.Column('source_branch', sa.String(), nullable=True),
    sa.Column('target_branch', sa.String(), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('ai_validation_status', sa.String(), nullable=True),
    sa.Column('ai_validation_score', sa.Float(), nullable=True),
    sa.Column('ai_validation_feedback', sa.Text(), nullable=True),
    sa.Column('ai_validation_concerns', sa.JSON(), nullable=True),
    sa.Column('ai_validation_suggestions', sa.JSON(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['author_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['source_repo_id'], ['repositories.id'], ),
    sa.ForeignKeyConstraint(['target_repo_id'], ['repositories.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('repository_collaborators',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('repository_id', sa.String(), nullable=False),
    sa.Column('user_id', sa.String(), nullable=False),
    sa.Column('role', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['repository_id'], ['repositories.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('repository_files',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('repository_id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('path', sa.String(), nullable=False),
    sa.Column('content', sa.Text(), nullable=True),
    sa.Column('file_type', sa.String(), nullable=False),
    sa.Column('size', sa.Integer(), nullable=True),
    sa.Column('author_id', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['author_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['repository_id'], ['repositories.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('comments',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('merge_request_id', sa.String(), nullable=False),
    sa.Column('author_id', sa.String(), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('line_number', sa.Integer(), nullable=True),
    sa.Column('file_path', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['author_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['merge_request_id'], ['merge_requests.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('file_changes',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('merge_request_id', sa.String(), nullable=False),
    sa.Column('file_path', sa.String(), nullable=False),
    sa.Column('change_type', sa.String(), nullable=False),
    sa.Column('additions', sa.Integer(), nullable=True),
    sa.Column('deletions', sa.Integer(), nullable=True),
    sa.Column('diff_content', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['merge_request_id'], ['merge_requests.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('hashed_password', sa.VARCHAR(length=255), autoincrement=False, nullable=False))
    op.add_column('users', sa.Column('full_name', sa.VARCHAR(length=255), autoincrement=False, nullable=False))
    op.drop_constraint(None, 'users', type_='unique')
    op.alter_column('users', 'role',
               existing_type=sa.VARCHAR(length=20),
               nullable=False)
    op.alter_column('users', 'id',
               existing_type=sa.String(),
               type_=sa.INTEGER(),
               existing_nullable=False)
    op.drop_column('users', 'updated_at')
    op.drop_column('users', 'created_at')
    op.drop_column('users', 'avatar')
    op.drop_column('users', 'clerk_id')
    op.drop_table('file_changes')
    op.drop_table('comments')
    op.drop_table('repository_files')
    op.drop_table('repository_collaborators')
    op.drop_table('merge_requests')
    op.drop_table('audit_entries')
    op.drop_table('repositories')
    # ### end Alembic commands ###